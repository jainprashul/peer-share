import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { NetworkQuality } from '../types';
import { networkMonitoringService } from '../services/NetworkMonitor';
import { peerJSService } from '../services/PeerJSService';

interface NetworkMonitorContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  currentQuality: NetworkQuality | null;
  qualityHistory: NetworkQuality[];
  isMonitoring: boolean;
  callState: {
    peerId: string | null;
    isConnected: boolean;
    isInCall: boolean;
    callPeerId: string | null;
  };
  fps: number;
  networkIssues: string[];
}

const NetworkMonitorContext = createContext<NetworkMonitorContextType | undefined>(undefined);

export const useNetworkMonitor = () => {
  const context = useContext(NetworkMonitorContext);
  if (!context) {
    throw new Error('useNetworkMonitor must be used within a NetworkMonitorProvider');
  }
  return context;
};

interface NetworkMonitorProviderProps {
  children: React.ReactNode;
}

export const NetworkMonitorProvider: React.FC<NetworkMonitorProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<NetworkQuality | null>(null);
  const [qualityHistory, setQualityHistory] = useState<NetworkQuality[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [callState, setCallState] = useState({
    peerId: null as string | null,
    isConnected: false,
    isInCall: false,
    callPeerId: null as string | null,
  });
  const [fps, setFps] = useState(0);
  const [networkIssues, setNetworkIssues] = useState<string[]>([]);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Update call state
  const updateCallState = useCallback(() => {
    const state = peerJSService.getCallState();
    setCallState(state);
  }, []);

  // Handle quality changes from PeerJS service (simplified quality object)
  const handleQualityChangedFromPeerJS = useCallback((quality: { score: number; latency: number; packetLoss: number; bandwidth: number }) => {
    console.log('handleQualityChangedFromPeerJS', quality);
    // Convert simplified quality to full NetworkQuality object
    const fullQuality: NetworkQuality = {
      timestamp: Date.now(),
      score: quality.score,
      latency: quality.latency,
      packetLoss: quality.packetLoss,
      bandwidth: quality.bandwidth,
      inbound: {
        score: quality.score,
        packetLoss: quality.packetLoss,
        bandwidth: quality.bandwidth,
        bytesReceived: 0,
        jitter: 0,
        packetsReceived: 0,
        packetsLost: 0
      },
      outbound: {
        score: quality.score,
        packetLoss: quality.packetLoss,
        bandwidth: quality.bandwidth,
        jitter: 0,
        packetsSent: 0,
        bytesSent: 0
      }
    };
    
    setCurrentQuality(fullQuality);
    setQualityHistory(prev => {
      const newHistory = [...prev, fullQuality];
      return newHistory.slice(-20); // Keep last 20 measurements
    });
  }, []);

  // Handle quality changes from NetworkMonitor service (full NetworkQuality object)
  const handleQualityChangedFromNetworkMonitor = useCallback((quality: NetworkQuality) => {
    setCurrentQuality(quality);
    setQualityHistory(prev => {
      const newHistory = [...prev, quality];
      return newHistory.slice(-20); // Keep last 20 measurements
    });
  }, []);

  // Handle FPS changes
  const handleFPSChanged = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  // Handle network issues
  const handleNetworkIssue = useCallback((issue: 'poor_quality' | 'connection_lost' | 'connection_restored') => {
    const timestamp = new Date().toLocaleTimeString();
    const issueMessage = `${timestamp}: ${issue.replace('_', ' ').toUpperCase()}`;
    
    setNetworkIssues(prev => {
      const newIssues = [issueMessage, ...prev];
      return newIssues.slice(0, 10); // Keep last 10 issues
    });
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Set up PeerJS service events
    peerJSService.setQualityEvents({
      onFPSChanged: handleFPSChanged,
      onQualityChanged: handleQualityChangedFromPeerJS,
      onNetworkIssue: handleNetworkIssue,
    });

    // Set up network monitoring service events
    networkMonitoringService.setEvents({
      subscribeToQualityChanged: handleQualityChangedFromNetworkMonitor,
      unsubscribeFromQualityChanged: () => handleNetworkIssue('connection_lost'),
      onConnectionLost: () => handleNetworkIssue('connection_lost'),
      onConnectionRestored: () => handleNetworkIssue('connection_restored'),
    });

    // Initial call state update
    updateCallState();

    // Set up interval to update call state
    const interval = setInterval(updateCallState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [handleQualityChangedFromPeerJS, handleQualityChangedFromNetworkMonitor, handleFPSChanged, handleNetworkIssue, updateCallState]);

  // Update monitoring state based on call state
  useEffect(() => {
    setIsMonitoring(callState.isInCall);
  }, [callState.isInCall]);

  const value: NetworkMonitorContextType = {
    isVisible,
    toggleVisibility,
    currentQuality,
    qualityHistory,
    isMonitoring,
    callState,
    fps,
    networkIssues,
  };

  return (
    <NetworkMonitorContext.Provider value={value}>
      {children}
    </NetworkMonitorContext.Provider>
  );
};
