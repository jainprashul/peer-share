import type { FPSConfig, NetworkQuality, VideoConstraints } from '../types';
import { networkMonitoringService } from './NetworkMonitor';

export interface AdaptiveMediaEvents {
  onFPSChanged?: (fps: number) => void;
  onQualityChanged?: (quality: NetworkQuality) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

/**
 * AdaptiveMediaController handles dynamic media quality adjustment
 * based on network conditions and user preferences
 */
export class AdaptiveMediaController {
  private fpsConfig: FPSConfig = {
    min: 15,
    max: 60,
    default: 30,
    adaptive: true,
    qualityLevels: {
      low: 15,
      medium: 30,
      high: 60
    }
  };
  
  private currentFPS: number = 30;
  private fpsAdjustmentInterval: NodeJS.Timeout | null = null;
  private events: AdaptiveMediaEvents = {};
  private networkMonitor = networkMonitoringService;
  
  // Stream management
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private isScreenSharing: boolean = false;

  constructor() {
    this.currentFPS = this.fpsConfig.default;
    this.setupNetworkMonitoringEvents();
  }


  /**
   * Set event handlers
   */
  setEvents(events: AdaptiveMediaEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Set FPS configuration
   */
  setFPSConfig(config: Partial<FPSConfig>): void {
    this.fpsConfig = { ...this.fpsConfig, ...config };
    this.currentFPS = this.fpsConfig.default;
  }

  /**
   * Get current FPS configuration
   */
  getFPSConfig(): FPSConfig {
    return { ...this.fpsConfig };
  }

  /**
   * Set target FPS manually
   */
  async setTargetFPS(fps: number): Promise<void> {
    if (fps < this.fpsConfig.min || fps > this.fpsConfig.max) {
      throw new Error(`FPS must be between ${this.fpsConfig.min} and ${this.fpsConfig.max}`);
    }

    this.currentFPS = fps;
    this.events.onFPSChanged?.(fps);
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get video constraints based on current FPS and quality
   */
  getVideoConstraints(): VideoConstraints {
    const networkQuality = this.networkMonitor.getCurrentQuality();
    const baseConstraints = {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: this.currentFPS, max: this.fpsConfig.max }
    };

    // Adjust based on network quality
    if (networkQuality.score < 0.3) {
      // Poor quality - reduce resolution and FPS
      baseConstraints.width.ideal = 640;
      baseConstraints.height.ideal = 480;
      baseConstraints.frameRate.ideal = Math.min(this.currentFPS, this.fpsConfig.qualityLevels.low);
    } else if (networkQuality.score < 0.7) {
      // Medium quality
      baseConstraints.width.ideal = 960;
      baseConstraints.height.ideal = 540;
      baseConstraints.frameRate.ideal = Math.min(this.currentFPS, this.fpsConfig.qualityLevels.medium);
    }

    return baseConstraints;
  }

  /**
   * Apply video constraints to a media stream
   */
  async applyVideoConstraints(stream: MediaStream): Promise<void> {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const constraints = this.getVideoConstraints();
      await videoTrack.applyConstraints({
        width: constraints.width,
        height: constraints.height,
        frameRate: constraints.frameRate
      });
    } catch (error) {
      console.warn('Failed to apply video constraints:', error);
    }
  }

  /**
   * Start monitoring network quality and adjusting FPS
   */
  startQualityMonitoring(peerConnection: RTCPeerConnection): void {
    // Start network monitoring
    this.networkMonitor.startMonitoring(peerConnection);

    // Start FPS adjustment interval
    if (this.fpsAdjustmentInterval) {
      clearInterval(this.fpsAdjustmentInterval);
    }

    this.fpsAdjustmentInterval = setInterval(() => {
      if (this.fpsConfig.adaptive) {
        if(this.isScreenSharingActive()) {
          this.applyVideoConstraints(this.screenStream!);
        } else {
          this.applyVideoConstraints(this.localStream!);
        }
      }
    }, 5000); // Adjust every 5 seconds
  }

  /**
   * Stop quality monitoring
   */
  stopQualityMonitoring(): void {
    this.networkMonitor.stopMonitoring();

    if (this.fpsAdjustmentInterval) {
      clearInterval(this.fpsAdjustmentInterval);
      this.fpsAdjustmentInterval = null;
    }
  }

  /**
   * Set up network monitoring event handlers
   */
  private setupNetworkMonitoringEvents(): void {
    this.networkMonitor.setEvents({
      onQualityChanged: (quality) => {
        this.events.onQualityChanged?.(quality);
      }
    });
  }

  /**
   * Adjust FPS based on network quality
   */
  private async adjustFPSBasedOnQuality(): Promise<void> {
    if (!this.fpsConfig.adaptive) return;

    const networkQuality = this.networkMonitor.getCurrentQuality();
    let targetFPS = this.currentFPS;

    if (networkQuality.score < 0.3) {
      // Poor quality - use low FPS
      targetFPS = this.fpsConfig.qualityLevels.low;
    } else if (networkQuality.score < 0.7) {
      // Medium quality - use medium FPS
      targetFPS = this.fpsConfig.qualityLevels.medium;
    } else {
      // Good quality - use high FPS
      targetFPS = this.fpsConfig.qualityLevels.high;
    }

    if (targetFPS !== this.currentFPS) {
      await this.setTargetFPS(targetFPS);
    }
  }

  /**
   * Get current network quality
   */
  getNetworkQuality(): NetworkQuality {
    return this.networkMonitor.getCurrentQuality();
  }

  /**
   * Update network quality manually (for testing or external monitoring)
   */
  updateNetworkQuality(quality: Partial<NetworkQuality>): void {
    this.networkMonitor.updateQualityManually(quality);
  }

  /**
   * Get quality-based resolution recommendations
   */
  getQualityRecommendations(): {
    recommendedResolution: { width: number; height: number };
    recommendedFPS: number;
    qualityLevel: 'low' | 'medium' | 'high';
  } {
    const networkQuality = this.networkMonitor.getCurrentQuality();
    let qualityLevel: 'low' | 'medium' | 'high' = 'high';
    let recommendedFPS = this.fpsConfig.qualityLevels.high;
    let recommendedResolution = { width: 1280, height: 720 };

    if (networkQuality.score < 0.3) {
      qualityLevel = 'low';
      recommendedFPS = this.fpsConfig.qualityLevels.low;
      recommendedResolution = { width: 640, height: 480 };
    } else if (networkQuality.score < 0.7) {
      qualityLevel = 'medium';
      recommendedFPS = this.fpsConfig.qualityLevels.medium;
      recommendedResolution = { width: 960, height: 540 };
    }

    return {
      recommendedResolution,
      recommendedFPS,
      qualityLevel
    };
  }

  /**
   * Get local media stream (camera and microphone)
   */
  async getLocalMedia(): Promise<MediaStream> {
    try {
      if (this.localStream) {
        return this.localStream;
      }
      const constraints = this.getVideoConstraints();
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: true
      });
      
      this.events.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing local media:', error);
      throw error;
    }
  }

  /** List all user media devices */
  async listUserMediaDevices(): Promise<MediaDeviceInfo[]> {
    return await navigator.mediaDevices.enumerateDevices();
  }

  /** Set local stream based on selected device */
  async setSourceDevice(deviceId: string): Promise<void> {
    const devices = await this.listUserMediaDevices();
    const device = devices.find(d => d.deviceId === deviceId);
    if (device) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: device.deviceId },
        audio: true
      });
      this.events.onLocalStream?.(this.localStream);
    }
  }

  /**
   * Set remote stream
   */
  setRemoteStream(stream: MediaStream): void {
    this.remoteStream = stream;
    this.events.onRemoteStream?.(stream);
  }

  /**
   * Get screen stream
   */
  async getScreenStream(): Promise<MediaStream> {
    const constraints = this.getVideoConstraints();
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: constraints,
        audio: true
      });

      this.isScreenSharing = true;
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  /**
   * Get screen stream (alias for getScreenStream)
   */
  async startScreenShare(): Promise<MediaStream> {
    return this.getScreenStream();
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;
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
   * Get current streams
   */
  getStreams() {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      screenStream: this.screenStream,
      isScreenSharing: this.isScreenSharing
    };
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if screen sharing is active
   */
  isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }

  /**
   * Clean up all streams
   */
  cleanupStreams(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.isScreenSharing = false;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopQualityMonitoring();
    this.cleanupStreams();
    this.networkMonitor.destroy();
  }
}

// Export singleton instance
export const adaptiveMediaController = new AdaptiveMediaController();
