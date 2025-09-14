// Shared types between client and server for Phase 1 POC

export interface User {
  id: string;
  username: string;
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


export interface PeerConfig {
  host: string;
  port: number;
  path: string;
  config: {
    iceServers: Array<{ urls: string }>;
  };
}


// WebSocket message types for communication
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
}

// Group-related message types
export interface CreateGroupMessage extends WebSocketMessage {
  type: 'create-group';
  payload: {
    groupName: string;
    username: string;
  };
}

export interface JoinGroupMessage extends WebSocketMessage {
  type: 'join-group';
  payload: {
    groupId: string;
    username: string;
    peerId?: string;
  };
}

export interface LeaveGroupMessage extends WebSocketMessage {
  type: 'leave-group';
  payload: {
    userId: string;
  };
}

// P2P/Call related message types
export interface CallRequestMessage extends WebSocketMessage {
  type: 'call-request';
  payload: {
    targetPeerId: string;
    fromPeerId: string;
    fromUsername: string;
  };
}

export interface CallResponseMessage extends WebSocketMessage {
  type: 'call-response';
  payload: {
    accepted: boolean;
    fromPeerId: string;
    toPeerId: string;
  };
}

// Server response message types
export interface GroupCreatedMessage extends WebSocketMessage {
  type: 'group-created';
  payload: {
    groupId: string;
    groupName: string;
    user: {
      id: string;
      username: string;
    };
  };
}

export interface GroupJoinedMessage extends WebSocketMessage {
  type: 'group-joined';
  payload: {
    groupId: string;
    groupName: string;
    user: {
      id: string;
      username: string;
    };
    members: Array<{
      id: string;
      username: string;
      peerId?: string;
    }>;
  };
}

export interface UserJoinedMessage extends WebSocketMessage {
  type: 'user-joined';
  payload: {
    user: {
      id: string;
      username: string;
      peerId?: string;
    };
  };
}

export interface UserLeftMessage extends WebSocketMessage {
  type: 'user-left';
  payload: {
    userId: string;
    username: string;
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: any;
  };
}

// Peer discovery message types
export interface PeerJoinedMessage extends WebSocketMessage {
  type: 'peer-joined';
  payload: {
    peerId: string;
    username: string;
  };
}

export interface ExistingPeersMessage extends WebSocketMessage {
  type: 'existing-peers';
  payload: {
    peers: Array<{
      peerId: string;
      username: string;
    }>;
  };
}

export interface IncomingCallRequestMessage extends WebSocketMessage {
  type: 'incoming-call-request';
  payload: {
    fromPeerId: string;
    fromUsername: string;
  };
}

export interface UpdatePeerIdMessage extends WebSocketMessage {
  type: 'update-peer-id';
  payload: {
    peerId: string;
  };
}

export interface ConnectionEstablishedMessage extends WebSocketMessage {
  type: 'connection-established';
  payload: {
    userId: string;
    username: string;
    groupId: string;
  };
}

// Union type for all possible message types
export type AllMessageTypes = 
  | CreateGroupMessage
  | JoinGroupMessage 
  | LeaveGroupMessage
  | CallRequestMessage
  | CallResponseMessage
  | GroupCreatedMessage
  | GroupJoinedMessage
  | UserJoinedMessage
  | UserLeftMessage
  | ErrorMessage
  | PeerJoinedMessage
  | ExistingPeersMessage
  | IncomingCallRequestMessage
  | UpdatePeerIdMessage
  | ConnectionEstablishedMessage;