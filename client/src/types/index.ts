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


// types for Button component
export type GradientVariant =
  | "purpleLight"
  | "purpleDark"
  | "greenLight"
  | "greenDark"
  | "redLight"
  | "redDark";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GradientVariant;
  size?: ButtonSize;
  outline?: boolean;
  className?: string;
}
