import type { NetworkQuality } from '../types';

export interface NetworkMonitorEvents {
  subscribeToQualityChanged?: (quality: NetworkQuality) => void;
  unsubscribeFromQualityChanged?: () => void;
  onQualityChanged?: (quality: NetworkQuality) => void;
  onConnectionLost?: () => void;
  onConnectionRestored?: () => void;
}

/**
 * NetworkMonitoringService handles real-time network quality monitoring
 * using WebRTC statistics and other network indicators
 */
export class NetworkMonitor {
  private qualityMonitorInterval: NodeJS.Timeout | null = null;
  private events: NetworkMonitorEvents = {};
  private last = {
    bytesReceived: 0,
    bytesSent: 0,
    timestamp: Date.now()
  }
  private currentQuality: NetworkQuality = {
    timestamp: Date.now(),
    score: 1.0, // 0-1, where 1 is excellent
    latency: 0, // in ms
    packetLoss: 0, // in percentage
    bandwidth: 0, // in kbps
    inbound: {
      score: 1.0,
      packetLoss: 0,
      bandwidth: 0,
      jitter: 0,
      packetsReceived: 0,
      packetsLost: 0,
      bytesReceived: 0
    },
    outbound: {
      score: 1.0,
      packetLoss: 0,
      bandwidth: 0,
      jitter: 0,
      packetsSent: 0,
      bytesSent: 0
    }
  };
  private isMonitoring: boolean = false;
  private lastQualityCheck: number = 0;
  private qualityHistory: NetworkQuality[] = [];
  private maxHistorySize: number = 10;

  constructor() {
  }

  /**
   * Set event handlers
   */
  setEvents(events: NetworkMonitorEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Start monitoring network quality using WebRTC stats
   */
  startMonitoring(peerConnection: RTCPeerConnection, intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    this.isMonitoring = true;
    this.qualityMonitorInterval = setInterval(() => {
      this.monitorNetworkQuality(peerConnection);
    }, intervalMs);

    // Initial check
    this.monitorNetworkQuality(peerConnection);
  }

  /**
   * Stop network quality monitoring
   */
  stopMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Monitor network quality using WebRTC statistics
   */
  private async monitorNetworkQuality(peerConnection: RTCPeerConnection): Promise<void> {
    try {
      const stats = await peerConnection.getStats();
      const params = peerConnection.getReceivers();
      console.log('params', params);
      const quality = this.analyzeWebRTCStats(stats);
      
      this.updateQuality(quality);
      this.lastQualityCheck = Date.now();
    } catch (error) {
      console.warn('Failed to monitor network quality:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Analyze WebRTC statistics to determine network quality
   */
  private analyzeWebRTCStats(stats: RTCStatsReport): NetworkQuality {
    let latency = 0;
    let overallPacketLoss = 0;
    let overallBandwidth = 1000;

    // Inbound metrics
    let inboundPacketLoss = 0;
    let inboundBandwidth = 0;
    let inboundJitter = 0;
    let inboundPacketsReceived = 0;
    let inboundPacketsLost = 0;
    let inboundBytesReceived = 0;
    let inboundDimensions: { width: number; height: number, frameRate: number } | undefined;

    // Outbound metrics
    let outboundPacketLoss = 0;
    let outboundBandwidth = 0;
    let outboundJitter = 0;
    let outboundPacketsSent = 0;
    let outboundBytesSent = 0;
    let outboundDimensions: { width: number; height: number, frameRate: number } | undefined;

    stats.forEach((report) => {
      // Calculate latency - how long it takes for a packet to travel from the sender to the receiver
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
      }
      
      // Inbound RTP statistics (receiving data)
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        inboundPacketsReceived = report.packetsReceived || 0;
        inboundBytesReceived = report.bytesReceived || 0;
        inboundPacketsLost = report.packetsLost || 0;
        inboundJitter = report.jitter || 0;
        
        // Calculate inbound packet loss percentage
        inboundPacketLoss = inboundPacketsReceived > 0 
          ? (inboundPacketsLost / (inboundPacketsReceived + inboundPacketsLost)) * 100 
          : 0;
        
        // Calculate inbound bandwidth from bytes received
        const bytesReceived = report.bytesReceived || 0;
        const diff = (bytesReceived - this.last.bytesReceived) * 8; // in bytes
        const timeDiff = (Date.now() - this.last.timestamp) / 1000; // in seconds
        this.last.bytesReceived = bytesReceived;

        console.log('diff', diff , 'timeDiff', timeDiff , 'inboundBandwidth', inboundBandwidth , 'bytesReceived', diff / (timeDiff * 1000));

        inboundBandwidth = diff / (timeDiff * 1000); // kbps in bytes
        inboundDimensions = {
          width: report.frameWidth,
          height: report.frameHeight,
          frameRate: report.framesPerSecond
        };
      }

      // Outbound RTP statistics (sending data)
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        outboundPacketsSent = report.packetsSent || 0;
        outboundBytesSent = report.bytesSent || 0;
        outboundJitter = report.jitter || 0;
        
        // Calculate outbound packet loss percentage
        const outboundPacketsLost = report.packetsLost || 0;
        outboundPacketLoss = outboundPacketsSent > 0 
          ? (outboundPacketsLost / (outboundPacketsSent + outboundPacketsLost)) * 100 
          : 0;
        
        // Calculate outbound bandwidth from bytes sent
        const diff = (outboundBytesSent - this.last.bytesSent) * 8; // in bytes
        const timeDiff = (Date.now() - this.last.timestamp) / 1000; // in seconds
        this.last.bytesSent = outboundBytesSent;
        this.last.timestamp = Date.now();

        console.log('diff', diff , 'timeDiff', timeDiff , 'outboundBandwidth', outboundBandwidth , 'bytesSent', diff / (timeDiff * 1000));

        outboundBandwidth = diff / (timeDiff * 1000); // kbps in bytes
        outboundDimensions = {
          width: report.frameWidth,
          height: report.frameHeight,
          frameRate: report.framesPerSecond
        };
      }
    });

    // Calculate overall metrics (average of inbound and outbound)
    overallPacketLoss = (inboundPacketLoss + outboundPacketLoss) / 2;
    overallBandwidth = Math.max(inboundBandwidth, outboundBandwidth);

    // Calculate individual quality scores
    const inboundScore = this.calculateDirectionalQualityScore({
      packetLoss: inboundPacketLoss,
      bandwidth: inboundBandwidth,
      jitter: inboundJitter
    });

    const outboundScore = this.calculateDirectionalQualityScore({
      packetLoss: outboundPacketLoss,
      bandwidth: outboundBandwidth,
      jitter: outboundJitter
    });

    // Calculate overall quality score
    const overallScore = this.calculateQualityScore({
      latency,
      packetLoss: overallPacketLoss,
      bandwidth: overallBandwidth,
      jitter: (inboundJitter + outboundJitter) / 2
    });

    return {
      timestamp: Date.now(),
      score: overallScore,
      latency,
      packetLoss: overallPacketLoss,
      bandwidth: overallBandwidth,
      inbound: {
        score: inboundScore,
        packetLoss: inboundPacketLoss,
        bandwidth: inboundBandwidth,
        bytesReceived: inboundBytesReceived,
        jitter: inboundJitter,
        packetsReceived: inboundPacketsReceived,
        packetsLost: inboundPacketsLost,
        dimensions: inboundDimensions
      },
      outbound: {
        score: outboundScore,
        packetLoss: outboundPacketLoss,
        bandwidth: outboundBandwidth,
        jitter: outboundJitter,
        packetsSent: outboundPacketsSent,
        bytesSent: outboundBytesSent,
        dimensions: outboundDimensions
      }
    };
  }

  /**
   * Calculate directional quality score (for inbound or outbound)
   */
  private calculateDirectionalQualityScore(metrics: {
    packetLoss: number;
    bandwidth: number;
    jitter: number;
  }): number {
    const { packetLoss, bandwidth, jitter } = metrics;

    // Packet loss score (0-1, penalize packet loss > 10%)
    const packetLossScore = Math.max(0, 1 - (packetLoss / 10));
    
    // Bandwidth score (0-1, scale with bandwidth)
    const bandwidthScore = Math.min(1, bandwidth / 2000);
    
    // Jitter score (0-1, penalize high jitter)
    const jitterScore = Math.max(0, 1 - (jitter / 100));

    // Weighted average for directional quality
    const score = (
      packetLossScore * 0.5 +
      bandwidthScore * 0.3 +
      jitterScore * 0.2
    );

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate overall quality score based on network metrics
   */
  private calculateQualityScore(metrics: {
    latency: number;
    packetLoss: number;
    bandwidth: number;
    jitter: number;
  }): number {
    const { latency, packetLoss, bandwidth, jitter } = metrics;

    // Latency score (0-1, penalize latency > 1000ms)
    const latencyScore = Math.max(0, 1 - (latency / 1000));
    
    // Packet loss score (0-1, penalize packet loss > 10%)
    const packetLossScore = Math.max(0, 1 - (packetLoss / 10));
    
    // Bandwidth score (0-1, scale with bandwidth)
    const bandwidthScore = Math.min(1, bandwidth / 2000);
    
    // Jitter score (0-1, penalize high jitter)
    const jitterScore = Math.max(0, 1 - (jitter / 100));

    // Weighted average
    const score = (
      latencyScore * 0.3 +
      packetLossScore * 0.4 +
      bandwidthScore * 0.2 +
      jitterScore * 0.1
    );

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Update quality and notify listeners
   */
  private updateQuality(quality: NetworkQuality): void {
    const previousQuality = this.currentQuality;
    this.currentQuality = quality;
    
    // Add to history
    this.qualityHistory.push({ ...quality });
    if (this.qualityHistory.length > this.maxHistorySize) {
      this.qualityHistory.shift();
    }

    // Check for significant changes
    const scoreChange = Math.abs(quality.score - previousQuality.score);
    const latencyChange = Math.abs(quality.latency - previousQuality.latency);
    
    // Notify if there's a significant change
    if (scoreChange > 0.1 || latencyChange > 100) {
      this.events.onQualityChanged?.(quality);
    }

    // Check for connection issues
    if (quality.score < 0.2 && previousQuality.score >= 0.2) {
      this.events.onConnectionLost?.();
    } else if (quality.score >= 0.5 && previousQuality.score < 0.5) {
      this.events.onConnectionRestored?.();
    }

    this.events.subscribeToQualityChanged?.(quality);
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(): void {
    // Mark as poor quality when connection fails
    const poorQuality: NetworkQuality = {
      timestamp: Date.now(),
      score: 0.1,
      latency: 9999,
      packetLoss: 50,
      bandwidth: 100,
      inbound: {
        score: 0.1,
        packetLoss: 50,
        bandwidth: 100,
        jitter: 100,
        packetsReceived: 0,
        packetsLost: 0,
        bytesReceived: 0
      },
      outbound: {
        score: 0.1,
        packetLoss: 50,
        bandwidth: 100,
        jitter: 100,
        packetsSent: 0,
        bytesSent: 0,
      }
    };
    
    this.updateQuality(poorQuality);
  }

  /**
   * Get current network quality
   */
  getCurrentQuality(): NetworkQuality {
    return { ...this.currentQuality };
  }

  /**
   * Get quality history for trend analysis
   */
  getQualityHistory(): NetworkQuality[] {
    return [...this.qualityHistory];
  }

  /**
   * Get average quality over a time period
   */
  getAverageQuality(timeWindowMs: number = 60000): NetworkQuality {
    const now = Date.now();
    const cutoff = now - timeWindowMs;
    
    const recentHistory = this.qualityHistory.filter((_, index) => {
      const timeOffset = (this.qualityHistory.length - index) * 5000; // Assuming 5s intervals
      return (now - timeOffset) >= cutoff;
    });

    if (recentHistory.length === 0) {
      return this.currentQuality;
    }

    const avgScore = recentHistory.reduce((sum, q) => sum + q.score, 0) / recentHistory.length;
    const avgLatency = recentHistory.reduce((sum, q) => sum + q.latency, 0) / recentHistory.length;
    const avgPacketLoss = recentHistory.reduce((sum, q) => sum + q.packetLoss, 0) / recentHistory.length;
    const avgBandwidth = recentHistory.reduce((sum, q) => sum + q.bandwidth, 0) / recentHistory.length;

    // Calculate average inbound metrics
    const avgInboundScore = recentHistory.reduce((sum, q) => sum + q.inbound.score, 0) / recentHistory.length;
    const avgInboundPacketLoss = recentHistory.reduce((sum, q) => sum + q.inbound.packetLoss, 0) / recentHistory.length;
    const avgInboundBandwidth = recentHistory.reduce((sum, q) => sum + q.inbound.bandwidth, 0) / recentHistory.length;
    const avgInboundJitter = recentHistory.reduce((sum, q) => sum + q.inbound.jitter, 0) / recentHistory.length;
    const avgInboundPacketsReceived = recentHistory.reduce((sum, q) => sum + q.inbound.packetsReceived, 0) / recentHistory.length;
    const avgInboundPacketsLost = recentHistory.reduce((sum, q) => sum + q.inbound.packetsLost, 0) / recentHistory.length;
    const avgInboundBytesReceived = recentHistory.reduce((sum, q) => sum + q.inbound.bytesReceived, 0) / recentHistory.length;

    // Calculate average outbound metrics
    const avgOutboundScore = recentHistory.reduce((sum, q) => sum + q.outbound.score, 0) / recentHistory.length;
    const avgOutboundPacketLoss = recentHistory.reduce((sum, q) => sum + q.outbound.packetLoss, 0) / recentHistory.length;
    const avgOutboundBandwidth = recentHistory.reduce((sum, q) => sum + q.outbound.bandwidth, 0) / recentHistory.length;
    const avgOutboundJitter = recentHistory.reduce((sum, q) => sum + q.outbound.jitter, 0) / recentHistory.length;
    const avgOutboundPacketsSent = recentHistory.reduce((sum, q) => sum + q.outbound.packetsSent, 0) / recentHistory.length;
    const avgOutboundBytesSent = recentHistory.reduce((sum, q) => sum + q.outbound.bytesSent, 0) / recentHistory.length;

    // Calculate average quality
    return {
      timestamp: Date.now(),
      score: avgScore,
      latency: avgLatency,
      packetLoss: avgPacketLoss,
      bandwidth: avgBandwidth,
      inbound: {
        score: avgInboundScore,
        packetLoss: avgInboundPacketLoss,
        bandwidth: avgInboundBandwidth,
        jitter: avgInboundJitter,
        packetsReceived: avgInboundPacketsReceived,
        packetsLost: avgInboundPacketsLost,
        bytesReceived: avgInboundBytesReceived
      },
      outbound: {
        score: avgOutboundScore,
        packetLoss: avgOutboundPacketLoss,
        bandwidth: avgOutboundBandwidth,
        jitter: avgOutboundJitter,
        packetsSent: avgOutboundPacketsSent,
        bytesSent: avgOutboundBytesSent
      }
    };
  }

  /**
   * Get quality trend (improving, degrading, stable)
   */
  getQualityTrend(): 'improving' | 'degrading' | 'stable' {
    if (this.qualityHistory.length < 3) {
      return 'stable';
    }

    const recent = this.qualityHistory.slice(-3);
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;
    const change = last - first;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Check if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get time since last quality check
   */
  getTimeSinceLastCheck(): number {
    return this.lastQualityCheck ? Date.now() - this.lastQualityCheck : 0;
  }

  /**
   * Update quality manually (for testing or external monitoring)
   */
  updateQualityManually(quality: Partial<NetworkQuality>): void {
    const newQuality = { ...this.currentQuality, ...quality };
    this.updateQuality(newQuality);
  }

  /**
   * Reset quality history
   */
  resetHistory(): void {
    this.qualityHistory = [];
  }

  /**
   * Get current inbound quality metrics
   */
  getInboundQuality(): NetworkQuality['inbound'] {
    return { ...this.currentQuality.inbound };
  }

  /**
   * Get current outbound quality metrics
   */
  getOutboundQuality(): NetworkQuality['outbound'] {
    return { ...this.currentQuality.outbound };
  }

  /**
   * Get inbound quality trend
   */
  getInboundQualityTrend(): 'improving' | 'degrading' | 'stable' {
    if (this.qualityHistory.length < 3) {
      return 'stable';
    }

    const recent = this.qualityHistory.slice(-3);
    const first = recent[0].inbound.score;
    const last = recent[recent.length - 1].inbound.score;
    const change = last - first;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Get outbound quality trend
   */
  getOutboundQualityTrend(): 'improving' | 'degrading' | 'stable' {
    if (this.qualityHistory.length < 3) {
      return 'stable';
    }

    const recent = this.qualityHistory.slice(-3);
    const first = recent[0].outbound.score;
    const last = recent[recent.length - 1].outbound.score;
    const change = last - first;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Check if inbound quality is poor
   */
  isInboundQualityPoor(threshold: number = 0.3): boolean {
    return this.currentQuality.inbound.score < threshold;
  }

  /**
   * Check if outbound quality is poor
   */
  isOutboundQualityPoor(threshold: number = 0.3): boolean {
    return this.currentQuality.outbound.score < threshold;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.resetHistory();
    this.events.unsubscribeFromQualityChanged?.();
  }
}

// Export singleton instance
export const networkMonitoringService = new NetworkMonitor();
