import type { Group, User } from '@peer-share/shared';
// Client-specific types for Phase 1 POC

// Additional client-specific types
export interface AppState {
  currentPage: 'landing' | 'group' | 'call';
  isLoading: boolean;
  error: string | null;
}

export interface VideoControlsState {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  targetFPS: number;
  adaptiveQuality: boolean;
}

export interface MediaPermissions {
  camera: boolean;
  microphone: boolean;
  screen: boolean;
}

// Component prop types
export interface LandingPageProps {
  onCreateGroup: (data: { groupName: string; username: string }) => void;
  isLoading: boolean;
  error: string | null;
  group?: Group | null;
}

export interface GroupPageProps {
  group: Group | null;
  members: User[];
  currentUser: User | null;
  onStartCall: (targetUserId: string) => void;
  onLeaveGroup: () => void;
  isLoading: boolean;
}

export interface CallPageProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  controls: VideoControlsState;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}


export interface MediaDebugDetails {
  width: number;
  height: number;
  frameRate: number;
  aspectRatio: number;
  bitrate: number;
  codec: string;
  codecName: string;
  codecDescription: string;
  capabilities: MediaTrackCapabilities;
}

export interface NetworkQuality {
  timestamp: number; // in ms
  score: number; // 0-1, where 1 is excellent
  latency: number; // in ms
  packetLoss: number; // percentage
  bandwidth: number; // estimated in kbps
  inbound: {
    score: number; // 0-1, where 1 is excellent
    packetLoss: number; // percentage
    bandwidth: number; // estimated in kbps
    jitter: number; // in ms
    packetsReceived: number;
    packetsLost: number;
    bytesReceived: number;
    dimensions?: {
      width: number;
      height: number;
      frameRate: number;
    };
  };
  outbound: {
    score: number; // 0-1, where 1 is excellent
    packetLoss: number; // percentage
    bandwidth: number; // estimated in kbps
    jitter: number; // in ms
    packetsSent: number;
    bytesSent: number;
    dimensions?: {
      width: number;
      height: number;
      frameRate: number;
    };
  };
}

export interface FPSConfig {
  min: number;
  max: number;
  default: number;
  adaptive: boolean;
  qualityLevels: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface VideoConstraints {
  width: { ideal: number; max: number };
  height: { ideal: number; max: number };
  frameRate: { ideal: number; max: number };
  bitrate?: number;
}