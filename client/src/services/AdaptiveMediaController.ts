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

  // Canvas-based screen sharing
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private currentResolution = { width: 1920, height: 1080 };
  private lastQualityScore = 1.0;
  private adaptationHistory: Array<{ timestamp: number; resolution: { width: number; height: number }; reason: string }> = [];

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
        // Trigger adaptive screen sharing when network quality changes
        if (this.isScreenSharing) {
          this.adaptScreenShareQuality(quality);
        }
      },
      onConnectionLost: () => {
        if (this.isScreenSharing) {
          this.adaptScreenShareQuality({ score: 0.1, latency: 9999, packetLoss: 50, bandwidth: 100 } as NetworkQuality);
        }
      },
      onConnectionRestored: () => {
        if (this.isScreenSharing) {
          this.adaptScreenShareQuality(this.networkMonitor.getCurrentQuality());
        }
      }
    });
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
   * Get screen stream (legacy method - now uses canvas approach)
   */
  async getScreenStream(): Promise<MediaStream> {
    return this.startAdaptiveScreenShare();
  }

  /**
   * Start screen share with adaptive canvas downscaling
   */
  async startAdaptiveScreenShare(): Promise<MediaStream> {
    try {
      // Get screen stream with high quality initially
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          frameRate: { ideal: 60, max: 60 },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: true,
      });

      const screenVideo = document.createElement("video");
      screenVideo.srcObject = screenStream;
      screenVideo.muted = false; // Prevent audio feedback
      await screenVideo.play();

      // Create canvas for downscaling
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.setCanvasResolution(1920, 1080);

      // Draw loop (downscale continuously)
      const draw = () => {
        if (this.ctx && this.canvas && screenVideo) {
          this.ctx.drawImage(screenVideo, 0, 0, this.canvas.width, this.canvas.height);
          this.animationFrameId = requestAnimationFrame(draw);
        }
      };
      draw();

      // Create stream from canvas with adaptive frame rate
      const networkQuality = this.networkMonitor.getCurrentQuality();
      const targetFPS = this.getAdaptiveFrameRate(networkQuality);
      
      this.canvasStream = this.canvas.captureStream(targetFPS);


      this.screenStream = this.canvasStream;
      this.isScreenSharing = true;

      // Stop handler
      screenStream.getVideoTracks()[0].onended = () => this.stopScreenShare();

      // Start network monitoring for screen share
      this.startScreenShareMonitoring();

      return this.canvasStream;
    } catch (error) {
      console.error('Error starting adaptive screen share:', error);
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
    // Stop animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop screen share monitoring
    this.stopScreenShareMonitoring();

    // Stop canvas stream
    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach(track => track.stop());
      this.canvasStream = null;
    }

    // Clean up canvas
    this.canvas = null;
    this.ctx = null;
    this.screenStream = null;
    this.isScreenSharing = false;
  }

  /**
   * Change canvas resolution dynamically
   */
  setCanvasResolution(width: number, height: number): void {
    this.currentResolution = { width, height };
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Get adaptive frame rate based on network quality
   */
  private getAdaptiveFrameRate(networkQuality: NetworkQuality): number {
    if (networkQuality.score < 0.3) {
      return this.fpsConfig.qualityLevels.low; // 15 FPS
    } else if (networkQuality.score < 0.7) {
      return this.fpsConfig.qualityLevels.medium; // 30 FPS
    } else {
      return this.fpsConfig.qualityLevels.high; // 60 FPS
    }
  }

  /**
   * Start screen share monitoring using NetworkMonitor
   */
  private startScreenShareMonitoring(): void {
    if (!this.isScreenSharing) return;
    
    // Get current quality and adapt immediately
    const currentQuality = this.networkMonitor.getCurrentQuality();
    this.adaptScreenShareQuality(currentQuality);
  }

  /**
   * Stop screen share monitoring
   */
  private stopScreenShareMonitoring(): void {
    // NetworkMonitor will continue running for other purposes
    // We just stop responding to its events for screen sharing
  }

  /**
   * Adapt screen share quality based on network conditions
   */
  private async adaptScreenShareQuality(quality: NetworkQuality): Promise<void> {
    if (!this.isScreenSharing || !this.canvas) return;

    const qualityChange = Math.abs(quality.score - this.lastQualityScore);
    
    // Only adapt if there's a significant quality change (>0.1) or it's been 10+ seconds
    const shouldAdapt = qualityChange > 0.1 || 
      (Date.now() - (this.adaptationHistory[this.adaptationHistory.length - 1]?.timestamp || 0)) > 10000;

    if (!shouldAdapt) return;

    const { targetResolution, targetFPS, reason } = this.calculateOptimalSettings(quality);
    
    // Only change if different from current settings
    if (targetResolution.width !== this.currentResolution.width || 
        targetResolution.height !== this.currentResolution.height) {
      
      console.log(`📊 Screen Share Adaptation: ${reason}`, {
        from: `${this.currentResolution.width}x${this.currentResolution.height}`,
        to: `${targetResolution.width}x${targetResolution.height}`,
        fps: targetFPS,
        networkScore: quality.score,
        outboundBandwidth: quality.outbound.bandwidth,
        outboundPacketLoss: quality.outbound.packetLoss
      });

      this.setCanvasResolution(targetResolution.width, targetResolution.height);
      await this.updateCanvasStreamFrameRate(targetFPS);
      
      // Record adaptation history
      this.adaptationHistory.push({
        timestamp: Date.now(),
        resolution: { ...targetResolution },
        reason
      });
      
      // Keep only last 10 adaptations
      if (this.adaptationHistory.length > 10) {
        this.adaptationHistory.shift();
      }
    }

    this.lastQualityScore = quality.score;
  }

  /**
   * Calculate optimal screen share settings based on network quality
   */
  private calculateOptimalSettings(quality: NetworkQuality): {
    targetResolution: { width: number; height: number };
    targetFPS: number;
    reason: string;
  } {
    const { score, outbound } = quality;
    
    // Use outbound metrics for screen sharing (we're sending)
    const bandwidth = outbound.bandwidth;
    const packetLoss = outbound.packetLoss;
    const jitter = outbound.jitter;

    // Determine quality level based on multiple factors
    let qualityLevel: 'low' | 'medium' | 'high';
    let reason: string;

    if (score < 0.3 || bandwidth < 500 || packetLoss > 5 || jitter > 50) {
      qualityLevel = 'low';
      reason = `Poor network (score: ${score.toFixed(2)}, bandwidth: ${bandwidth.toFixed(0)}kbps, loss: ${packetLoss.toFixed(1)}%)`;
    } else if (score < 0.7 || bandwidth < 1500 || packetLoss > 2 || jitter > 25) {
      qualityLevel = 'medium';
      reason = `Medium network (score: ${score.toFixed(2)}, bandwidth: ${bandwidth.toFixed(0)}kbps, loss: ${packetLoss.toFixed(1)}%)`;
    } else {
      qualityLevel = 'high';
      reason = `Good network (score: ${score.toFixed(2)}, bandwidth: ${bandwidth.toFixed(0)}kbps, loss: ${packetLoss.toFixed(1)}%)`;
    }

    // Map quality level to resolution and FPS
    const settings = {
      low: {
        resolution: { width: 854, height: 480 },
        fps: this.fpsConfig.qualityLevels.low,
        reason: `${reason} → 480p`
      },
      medium: {
        resolution: { width: 1280, height: 720 },
        fps: this.fpsConfig.qualityLevels.medium,
        reason: `${reason} → 720p`
      },
      high: {
        resolution: { width: 1920, height: 1080 },
        fps: this.fpsConfig.qualityLevels.high,
        reason: `${reason} → 1080p`
      }
    };

    const target = settings[qualityLevel];
    return {
      targetResolution: target.resolution,
      targetFPS: target.fps,
      reason: target.reason
    };
  }

  /**
   * Update canvas stream frame rate
   */
  private async updateCanvasStreamFrameRate(targetFPS: number): Promise<void> {
    if (!this.canvasStream) return;

    const track = this.canvasStream.getVideoTracks()[0];
    if (track) {
      try {
        await track.applyConstraints({ frameRate: targetFPS });
        
        // Update canvas stream with new frame rate
        this.canvasStream = this.canvas!.captureStream(targetFPS);
        
        // Note: Track replacement should be handled by the calling service
        // (e.g., PeerJSService) as it has access to the peer connection
      } catch (error) {
        console.warn('Failed to update frame rate:', error);
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
   * Get screen share statistics and adaptation history
   */
  getScreenShareStats(): {
    isActive: boolean;
    currentResolution: { width: number; height: number };
    networkQuality: NetworkQuality;
    adaptationHistory: Array<{ timestamp: number; resolution: { width: number; height: number }; reason: string }>;
    lastAdaptation?: { timestamp: number; resolution: { width: number; height: number }; reason: string };
  } {
    const networkQuality = this.networkMonitor.getCurrentQuality();
    const lastAdaptation = this.adaptationHistory[this.adaptationHistory.length - 1];

    return {
      isActive: this.isScreenSharing,
      currentResolution: { ...this.currentResolution },
      networkQuality,
      adaptationHistory: [...this.adaptationHistory],
      lastAdaptation
    };
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

    // Stop screen sharing with canvas cleanup
    this.stopScreenShare();
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