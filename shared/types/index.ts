// Shared types between client and server for Phase 1 POC

export interface User {
  id: string;
  username: string;
  socketId: string;
  groupId: string | null;
  peerId?: string; // PeerJS peer ID for WebRTC connections
}

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  members: Map<string, User>;
}

export interface CreateGroupForm {
  groupName: string;
  username: string;
}

export interface JoinGroupForm {
  username: string;
}

export interface GroupState {
  currentGroup: Group | null;
  currentUser: User | null;
  members: User[];
  isConnected: boolean;
}

export interface CallState {
  isInCall: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peer: any; // Will be typed as Peer when PeerJS is imported
  mediaConnection: any; // Will be typed as MediaConnection when PeerJS is imported
  peerId: string | null;
}

// Socket.IO event types
export interface ServerToClientEvents {
  'user-joined': (data: { username: string; peerId: string; userId: string }) => void;
  'user-left': (data: { username: string; userId: string }) => void;
  'existing-peers': (peers: Array<{ username: string; peerId: string; userId: string }>) => void;
  'incoming-call-request': (data: { fromPeerId: string; fromUsername: string }) => void;
  'group-created': (data: { groupId: string; group: Omit<Group, 'members'> }) => void;
  'group-joined': (data: { group: Omit<Group, 'members'>; members: User[] }) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'create-group': (data: { groupName: string; username: string }, callback: (response: { success: boolean; groupId?: string; error?: string }) => void) => void;
  'join-group': (data: { groupId: string; username: string; peerId: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'leave-group': () => void;
  'call-request': (data: { targetPeerId: string; fromPeerId: string }) => void;
}

export interface PeerConfig {
  host: string;
  port: number;
  path: string;
  config: {
    iceServers: Array<{ urls: string }>;
  };
}
