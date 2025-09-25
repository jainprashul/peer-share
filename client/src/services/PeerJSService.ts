import Peer, { type MediaConnection } from 'peerjs';
import { webSocketService } from './WebSocketService';
import { userActions } from '../store/context/userSlice';
import store from '../store/store';
import { adaptiveMediaController } from './AdaptiveMediaController';
import { networkMonitoringService } from './NetworkMonitor';

export interface CallEvents {
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onCallError?: (error: Error) => void;
  onIncomingCall?: (fromPeerId: string, fromUsername: string) => void;
  onRemoteStreamReceived?: (stream: MediaStream) => void;
  onConnectionStateChanged?: (state: 'connecting' | 'connected' | 'disconnected') => void;
}

export interface MediaEvents {
  onLocalStreamReady?: (stream: MediaStream) => void;
  onRemoteStreamReady?: (stream: MediaStream) => void;
  onScreenShareStarted?: () => void;
  onScreenShareEnded?: () => void;
  onMuteToggled?: (isMuted: boolean) => void;
  onVideoToggled?: (isVideoEnabled: boolean) => void;
}

export interface QualityEvents {
  onFPSChanged?: (fps: number) => void;
  onQualityChanged?: (quality: { score: number; latency: number; packetLoss: number; bandwidth: number }) => void;
  onNetworkIssue?: (issue: 'poor_quality' | 'connection_lost' | 'connection_restored') => void;
}

/**
 * PeerJSService - Clean P2P connection management
 * Handles only PeerJS connections, delegates media management to AdaptiveMediaController
 */
export class PeerJSService {
  private peer: Peer | null = null;
  private activeCall: MediaConnection | null = null;
  private peerId: string | null = null;
  private isInitialized: boolean = false;
  
  // Event handlers
  private callEvents: CallEvents = {};
  private mediaEvents: MediaEvents = {};
  private qualityEvents: QualityEvents = {};

  constructor() {
    this.setupWebSocketHandlers();
    this.setupMediaControllerEvents();
  }

  /**
   * Initialize PeerJS connection
   */
  async initialize(): Promise<string> {
    if (this.isInitialized) {
      return this.peerId!;
    }

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer();

        this.peer.on('open', (id: string) => {
          console.log('PeerJS initialized with ID:', id);
          this.peerId = id;
          this.isInitialized = true;
          
          // Notify server and store
          webSocketService.updatePeerId(id);
          store.dispatch(userActions.setPeerId(id));
          
          this.callEvents.onConnectionStateChanged?.('connected');
          resolve(id);
        });

        this.peer.on('call', (call: MediaConnection) => {
          console.log('Incoming call from:', call.peer);
          this.handleIncomingCall(call);
        });

        this.peer.on('error', (error: Error) => {
          console.error('PeerJS error:', error);
          this.callEvents.onCallError?.(error);
        });

        this.peer.on('disconnected', () => {
          console.log('PeerJS disconnected, attempting to reconnect...');
          this.callEvents.onConnectionStateChanged?.('disconnected');
          this.peer?.reconnect();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start a call to another peer
   */
  async startCall(remotePeerId: string): Promise<void> {
    if (!this.isInitialized || !this.peer) {
      throw new Error('PeerJS not initialized');
    }

    const localStream = await adaptiveMediaController.getLocalMedia();
    if (!localStream) {
      throw new Error('No local media stream available');
    }
    try {
      this.activeCall = this.peer.call(remotePeerId, localStream);
      this.setupCallHandlers(this.activeCall);
      this.callEvents.onCallStarted?.();
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(): Promise<void> {
    console.log(this.activeCall, 'activeCall');
    // if (!this.activeCall) {
    //   throw new Error('No incoming call to answer');
    // }

    const localStream = await adaptiveMediaController.getLocalMedia();
    if (!localStream) {
      throw new Error('No local media stream available');
    }

    try {
      this.activeCall?.answer(localStream);
      this.callEvents.onCallStarted?.();
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    if (this.activeCall) {
      this.activeCall.close();
      this.activeCall = null;
    }
    
    adaptiveMediaController.stopQualityMonitoring();
    this.callEvents.onCallEnded?.();
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    const screenStream = await adaptiveMediaController.getScreenStream();
    
    if (this.activeCall) {
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.activeCall.peerConnection.getSenders()
        .find(s => s.track && s.track.kind === 'video');

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      // Handle screen share end
      videoTrack.onended = () => {
        adaptiveMediaController.stopScreenShare();
        this.mediaEvents.onScreenShareEnded?.();
      };
    }

    this.mediaEvents.onScreenShareStarted?.();
    return screenStream;
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    adaptiveMediaController.stopScreenShare();
    
    if (this.activeCall) {
      const localStream = await adaptiveMediaController.getLocalMedia();
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = this.activeCall.peerConnection.getSenders()
          .find(s => s.track && s.track.kind === 'video');

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }

    this.mediaEvents.onScreenShareEnded?.();
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    const isMuted = !adaptiveMediaController.toggleMute();
    this.mediaEvents.onMuteToggled?.(isMuted);
    return isMuted;
  }

  /**
   * Toggle video state
   */
  toggleVideo(): boolean {
    const isVideoEnabled = !adaptiveMediaController.toggleVideo();
    this.mediaEvents.onVideoToggled?.(isVideoEnabled);
    return isVideoEnabled;
  }

  /**
   * Get current call state
   */
  getCallState() {
    return {
      peerId: this.peerId,
      isConnected: this.isInitialized,
      isInCall: this.activeCall !== null,
      callPeerId: this.activeCall?.peer || null
    };
  }

  /**
   * Get media streams
   */
  getMediaStreams() {
    return adaptiveMediaController.getStreams();
  }

  /**
   * Set call event handlers
   */
  setCallEvents(events: CallEvents): void {
    this.callEvents = { ...this.callEvents, ...events };
  }

  /**
   * Set media event handlers
   */
  setMediaEvents(events: MediaEvents): void {
    this.mediaEvents = { ...this.mediaEvents, ...events };
  }

  /**
   * Set quality event handlers
   */
  setQualityEvents(events: QualityEvents): void {
    this.qualityEvents = { ...this.qualityEvents, ...events };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.endCall();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    adaptiveMediaController.destroy();
    networkMonitoringService.destroy();

    this.peerId = null;
    this.isInitialized = false;
  }

  /**
   * Handle incoming call
   */
  private handleIncomingCall(call: MediaConnection): void {
    this.activeCall = call;
    this.setupCallHandlers(call);
    this.callEvents.onIncomingCall?.(call.peer, 'Unknown');
  }

  /**
   * Set up call event handlers
   */
  private setupCallHandlers(call: MediaConnection): void {
    call.on('stream', (stream: MediaStream) => {
      console.log('Received remote stream');
      adaptiveMediaController.setRemoteStream(stream);
      this.callEvents.onRemoteStreamReceived?.(stream);
      this.mediaEvents.onRemoteStreamReady?.(stream);
      
      // Start quality monitoring
      if (call.peerConnection) {
        adaptiveMediaController.startQualityMonitoring(call.peerConnection);
      }
    });

    call.on('close', () => {
      console.log('Call ended');
      this.activeCall = null;
      adaptiveMediaController.stopQualityMonitoring();
      this.callEvents.onCallEnded?.();
    });

    call.on('error', (error: Error) => {
      console.error('Call error:', error);
      this.callEvents.onCallError?.(error);
    });
  }

  /**
   * Set up media controller event handlers
   */
  private setupMediaControllerEvents(): void {
    adaptiveMediaController.setEvents({
      onLocalStream: (stream: MediaStream) => {
        this.mediaEvents.onLocalStreamReady?.(stream);
      },
      onRemoteStream: (stream: MediaStream) => {
        this.mediaEvents.onRemoteStreamReady?.(stream);
      },
      onFPSChanged: (fps: number) => {
        this.qualityEvents.onFPSChanged?.(fps);
      },
      onQualityChanged: (quality: any) => {
        this.qualityEvents.onQualityChanged?.(quality);
      }
    });

    networkMonitoringService.setEvents({
      onQualityChanged: (quality) => {
        this.qualityEvents.onQualityChanged?.(quality);
      },
      onConnectionLost: () => {
        this.qualityEvents.onNetworkIssue?.('connection_lost');
      },
      onConnectionRestored: () => {
        this.qualityEvents.onNetworkIssue?.('connection_restored');
      }
    });
  }

  /**
   * Set up WebSocket message handlers
   */
  private setupWebSocketHandlers(): void {
    webSocketService.on('incoming-call-request', (message) => {
      if (message.type !== 'incoming-call-request') return;
      const { fromPeerId, fromUsername } = message.payload;
      this.callEvents.onIncomingCall?.(fromPeerId, fromUsername);
    });
  }
}

// Export singleton instance
export const peerJSService = new PeerJSService();