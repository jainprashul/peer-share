import React from 'react';
import { useNetworkMonitor } from '../contexts/NetworkMonitorContext';

const NetworkMonitorOverlay: React.FC = () => {
  const {
    isVisible,
    toggleVisibility,
    currentQuality,
    qualityHistory,
    isMonitoring,
    callState,
    fps,
    networkIssues,
  } = useNetworkMonitor();

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors"
        title="Show Network Monitor"
      >
        📊 Monitor
      </button>
    );
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    if (score >= 0.2) return 'Poor';
    return 'Critical';
  };

  const formatBandwidth = (bandwidth: number) => {
    if (bandwidth >= 1) return `${(bandwidth).toFixed(1)} Mbps`;
    return `${bandwidth.toFixed(0)} kbps`;
  };

  const formatLatency = (latency: number) => {
    return `${latency.toFixed(0)} ms`;
  };

  const formatPacketLoss = (packetLoss: number) => {
    return `${packetLoss.toFixed(2)}%`;
  };

  function RenderMetrics() {
    if (!callState.isInCall) { return null; }
    return (
      <>
       {/* Overall Quality */}
       {currentQuality && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Quality</span>
            <span className={`text-lg font-bold ${getQualityColor(currentQuality.score)}`}>
              {getQualityLabel(currentQuality.score)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                currentQuality.score >= 0.8 ? 'bg-green-500' :
                currentQuality.score >= 0.6 ? 'bg-yellow-500' :
                currentQuality.score >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${currentQuality.score * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Score: {(currentQuality.score * 100).toFixed(1)}%</div>
            <div>Latency: {formatLatency(currentQuality.latency)}</div>
            <div>Packet Loss: {formatPacketLoss(currentQuality.packetLoss)}</div>
            <div>Bandwidth: {formatBandwidth(currentQuality.bandwidth)}</div>
          </div>
        </div>
      )}

      {/* Inbound/Outbound Quality */}
      {currentQuality && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Inbound */}
            <div>
              <div className="text-sm font-medium text-green-400 mb-2">Inbound</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className={getQualityColor(currentQuality.inbound.score)}>
                    {(currentQuality.inbound.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packets:</span>
                  <span>{currentQuality.inbound.packetsReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span>Received:</span>
                  <span>{(currentQuality.inbound.bytesReceived / 1024).toFixed(1)}KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Lost:</span>
                  <span className="text-red-400">{currentQuality.inbound.packetsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jitter:</span>
                  <span>{currentQuality.inbound.jitter.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth:</span>
                  <span>{formatBandwidth(currentQuality.inbound.bandwidth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{currentQuality.inbound.dimensions?.width}x{currentQuality.inbound.dimensions?.height}@{currentQuality.inbound.dimensions?.frameRate}FPS</span>
                </div>
              </div>
            </div>

            {/* Outbound */}
            <div>
              <div className="text-sm font-medium text-blue-400 mb-2">Outbound</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className={getQualityColor(currentQuality.outbound.score)}>
                    {(currentQuality.outbound.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packets:</span>
                  <span>{currentQuality.outbound.packetsSent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes:</span>
                  <span>{(currentQuality.outbound.bytesSent / 1024).toFixed(1)}KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Jitter:</span>
                  <span>{currentQuality.outbound.jitter.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth:</span>
                  <span>{formatBandwidth(currentQuality.outbound.bandwidth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{currentQuality.outbound.dimensions?.width}x{currentQuality.outbound.dimensions?.height}@{currentQuality.outbound.dimensions?.frameRate}FPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FPS */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Video Performance</span>
          <span className={`text-lg font-bold ${
            fps >= 25 ? 'text-green-400' : fps >= 15 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {fps} FPS
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              fps >= 25 ? 'bg-green-500' : fps >= 15 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (fps / 30) * 100)}%` }}
          />
        </div>
      </div>

      {/* Quality History Chart */}
      {qualityHistory.length > 1 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Quality Trend</div>
          <div className="flex items-end space-x-1 h-16 bg-gray-800 rounded p-2">
            {qualityHistory.slice(-10).map((quality, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  quality.score >= 0.8 ? 'bg-green-500' :
                  quality.score >= 0.6 ? 'bg-yellow-500' :
                  quality.score >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ height: `${quality.score * 100}%` }}
                title={`Score: ${(quality.score * 100).toFixed(1)}%`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Network Issues */}
      {networkIssues.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-red-400 mb-2">Recent Issues</div>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {networkIssues.slice(0, 5).map((issue, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-900 bg-opacity-30 p-1 rounded">
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      </>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-400">Network Monitor</h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-white transition-colors"
          title="Hide Monitor"
        >
          ✕
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Connection Status</span>
          <div className={`px-2 py-1 rounded text-xs ${
            callState.isConnected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {callState.isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>Peer ID: {callState.peerId || 'N/A'}</div>
          <div>In Call: {callState.isInCall ? 'Yes' : 'No'}</div>
          {callState.callPeerId && <div>Call with: {callState.callPeerId}</div>}
          <div>Monitoring: {isMonitoring ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      <RenderMetrics />
     
      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {currentQuality ? new Date(currentQuality.timestamp).toLocaleTimeString() : 'N/A'}
      </div>
    </div>
  );
};

export default NetworkMonitorOverlay;
