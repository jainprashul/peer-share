import WebSocket from 'ws';
import { User as SharedUser, Group as SharedGroup } from '@peer-share/shared';
export interface User extends SharedUser {
  websocket: WebSocket;
}

export interface Group extends SharedGroup {
  members: Map<string, User>;
}

// WebSocket connection with user context
export interface UserWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  groupId?: string;
  isAlive?: boolean;
}

// Error codes for standardized error handling
export enum ErrorCodes {
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_GROUP_NAME = 'INVALID_GROUP_NAME',
  INVALID_USERNAME = 'INVALID_USERNAME',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  PEER_NOT_FOUND = 'PEER_NOT_FOUND'
}