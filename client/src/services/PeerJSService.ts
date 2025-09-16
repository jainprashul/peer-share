import Peer, { type MediaConnection } from 'peerjs';
import { webSocketService } from './WebSocketService';
import { userActions } from '../store/context/userSlice';
import store from '../store/store';

export interface PeerJSEvents {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onError?: (error: Error) => void;
  onIncomingCall?: (fromPeerId: string, fromUsername: string) => void;
  onScreenSharingStarted?: () => void;
  onScreenSharingEnded?: () => void;
}

/**
 * PeerJSService handles P2P video calling using PeerJS
 * Integrates with WebSocketService for signaling
 */
export class PeerJSService {
  private peer: Peer | null = null;
  private mediaConnection: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private isScreenSharing: boolean = false;
  private currentPeerId: string | null = null;
  private events: PeerJSEvents = {};

  constructor() {
    this.setupWebSocketHandlers();
  }

  /**
   * Initialize PeerJS with a unique peer ID
   */
  async initializePeer(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // this.peer = new Peer(userId, {
        //   host: 'localhost',
        //   port: 3001,
        //   path: '/peerjs',
        //   config: {
        //     iceServers: [
        //       { urls: 'stun:stun.l.google.com:19302' },
        //       { urls: 'stun:stun.services.mozilla.com' }
        //     ]
        //   }
        // });
        this.peer = new Peer();

        this.peer.on('open', (peerId: string) => {
          console.log('PeerJS initialized with ID:', peerId);
          this.currentPeerId = peerId;
          
          // Notify server about our peer ID
          webSocketService.updatePeerId(peerId);
          // Save 
          store.dispatch(userActions.setPeerId(peerId));
          resolve(peerId);
        });

        this.peer.on('call', (call: MediaConnection) => {
          console.log('Incoming call from:', call.peer);
          this.handleIncomingCall(call);
        });

        this.peer.on('error', (error: Error) => {
          console.error('PeerJS error:', error);
          this.events.onError?.(error);
        });

        this.peer.on('disconnected', () => {
          console.log('PeerJS disconnected, attempting to reconnect...');
          this.peer?.reconnect();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get local media stream (camera and microphone)
   */
  async getLocalMedia(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      this.events.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing local media:', error);
      throw error;
    }
  }

  /**
   * Start a call with another peer
   */
  async startCall(remotePeerId: string): Promise<void> {
    if (!this.peer || !this.localStream) {
      throw new Error('Peer not initialized or no local stream');
    }

    try {
      this.mediaConnection = this.peer.call(remotePeerId, this.localStream);
      this.setupCallHandlers(this.mediaConnection);
      this.events.onCallStarted?.();
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(): Promise<void> {
    if (!this.mediaConnection || !this.localStream) {
      throw new Error('No incoming call or no local stream');
    }

    try {
      this.mediaConnection.answer(this.localStream);
      this.events.onCallStarted?.();
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    if (this.isScreenSharing) {
      this.stopScreenShare();
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
    if (this.mediaConnection) {
      this.mediaConnection.close();
      this.mediaConnection = null;
    }
    this.events.onCallEnded?.();
  }
  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace the video track in the current call
      if (this.mediaConnection && this.localStream) {
        const videoTrack = this.screenStream.getVideoTracks()[0];
        const sender = this.mediaConnection.peerConnection.getSenders()
          .find(s => s.track && s.track.kind === 'video');

        this.isScreenSharing = true;
        this.events.onScreenSharingStarted?.();
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing and return to camera
   */
  async stopScreenShare(): Promise<void> {
    if (this.mediaConnection && this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.mediaConnection.peerConnection.getSenders()
        .find(s => s.track && s.track.kind === 'video');

      this.isScreenSharing = false;
      this.events.onScreenSharingEnded?.();
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle video state
   */
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Set event handlers
   */
  setEvents(events: PeerJSEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      peerId: this.currentPeerId,
      isConnected: this.peer?.open || false,
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      isInCall: this.mediaConnection !== null
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.endCall();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.currentPeerId = null;
  }

  /**
   * Handle incoming call
   */
  private handleIncomingCall(call: MediaConnection): void {
    this.mediaConnection = call;
    this.setupCallHandlers(call);
    
    // Notify about incoming call
    this.events.onIncomingCall?.(call.peer, 'Unknown'); // Username will be updated via WebSocket
  }

  /**
   * Set up call event handlers
   */
  private setupCallHandlers(call: MediaConnection): void {
    call.on('stream', (stream: MediaStream) => {
      console.log('Received remote stream');
      this.remoteStream = stream;
      this.events.onRemoteStream?.(stream);
    });

    call.on('close', () => {
      console.log('Call ended');
      this.mediaConnection = null;
      this.remoteStream = null;
      this.events.onCallEnded?.();
    });

    call.on('error', (error: Error) => {
      console.error('Call error:', error);
      this.events.onError?.(error);
    });
  }

  /**
   * Set up WebSocket message handlers for call signaling
   */
  private setupWebSocketHandlers(): void {
    webSocketService.on('incoming-call-request', (message) => {
      if (message.type !== 'incoming-call-request') return;
      const { fromPeerId, fromUsername } = message.payload;
      this.events.onIncomingCall?.(fromPeerId, fromUsername);
    });
  }
}

// Export singleton instance
export const peerJSService = new PeerJSService();
