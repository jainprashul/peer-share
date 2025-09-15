import WebSocket from 'ws';
import { ZodError } from 'zod';
import { GroupManager } from '../managers/GroupManager';
import { UserWebSocket, ErrorCodes } from '../types/index';
import { 
  validateMessage,
  IncomingMessage,
  CreateGroupMessage,
  JoinGroupMessage,
  LeaveGroupMessage,
  CallRequestMessage,
  CallResponseMessage,
  UpdatePeerIdMessage
} from '../validation/schemas';
import { logger } from '../utils';

/**
 * WebSocketHandler manages WebSocket connections and message routing
 * Replaces Socket.IO functionality with native WebSocket implementation
 */
export class WebSocketHandler {
  private groupManager: GroupManager;

  constructor(groupManager: GroupManager) {
    this.groupManager = groupManager;
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: UserWebSocket): void {
    logger.log('New WebSocket connection established with userId: ' + ws.userId);

    // Set up connection properties
    ws.isAlive = true;
    
    // Set up ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    this.sendMessage(ws, {
      type: 'connection-established',
      payload: {
        userId: ws.userId,
        username: ws.username,
        groupId: ws.groupId
      }
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const rawMessage = JSON.parse(data.toString());
        this.handleMessage(ws, rawMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.sendError(ws, ErrorCodes.INVALID_MESSAGE, 'Invalid JSON format');
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }

  /**
   * Route incoming messages to appropriate handlers
   */
  private handleMessage(ws: UserWebSocket, rawMessage: any): void {
    try {
      // Validate incoming message with Zod
      const message: IncomingMessage = validateMessage(rawMessage);
      logger.log(`Received validated message type: ${message.type}`);

      switch (message.type) {
        case 'create-group':
          this.handleCreateGroup(ws, message);
          break;
        
        case 'join-group':
          this.handleJoinGroup(ws, message);
          break;
        
        case 'leave-group':
          this.handleLeaveGroup(ws, message);
          break;
        
        case 'call-request':
          this.handleCallRequest(ws, message);
          break;
        
        case 'call-response':
          this.handleCallResponse(ws, message);
          break;
        
        case 'update-peer-id':
          this.handleUpdatePeerId(ws, message);
          break;

        default:
          // TypeScript will ensure this is never reached due to discriminated union
          console.warn(`Unhandled message type: ${(message as any).type}`);
          this.sendError(ws, ErrorCodes.INVALID_MESSAGE, `Unknown message type: ${(message as any).type}`);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.errors);
        this.sendError(
          ws, 
          ErrorCodes.INVALID_MESSAGE, 
          'Invalid message format',
          { validationErrors: error.errors }
        );
      } else {
        console.error(`Error handling message:`, error);
        this.sendError(ws, ErrorCodes.CONNECTION_ERROR, 'Failed to process message');
      }
    }
  }

  /**
   * Handle group creation
   */
  private handleCreateGroup(ws: UserWebSocket, message: CreateGroupMessage): void {
    const { groupName, username } = message.payload;

    try {
      const { groupId, user } = this.groupManager.createGroup(groupName, username, ws);
      
      // Update WebSocket with user info
      ws.userId = user.id;
      ws.username = user.username;
      ws.groupId = groupId;

      // Send success response
      this.sendMessage(ws, {
        type: 'group-created',
        payload: {
          groupId,
          groupName,
          user: {
            id: user.id,
            username: user.username
          }
        }
      });

    } catch (error: any) {
      this.sendError(ws, error.message, 'Failed to create group');
    }
  }

  /**
   * Handle joining a group
   */
  private handleJoinGroup(ws: UserWebSocket, message: JoinGroupMessage): void {
    const { groupId, username, peerId } = message.payload;

    try {
      const user = this.groupManager.joinGroup(groupId, username, ws, peerId);
      const group = this.groupManager.getGroup(groupId);
      
      if (!group) {
        throw new Error(ErrorCodes.GROUP_NOT_FOUND);
      }

      // Update WebSocket with user info
      ws.userId = user.id;
      ws.username = user.username;
      ws.groupId = groupId;

      // Get current members for the joining user
      const members = this.groupManager.getGroupMembers(groupId)
        .filter(member => member.id !== user.id) // Exclude the joining user
        .map(member => ({
          id: member.id,
          username: member.username,
          peerId: member.peerId
        }));

      // Send success response to joining user
      this.sendMessage(ws, {
        type: 'group-joined',
        payload: {
          groupId,
          groupName: group.name,
          user: {
            id: user.id,
            username: user.username
          },
          members
        }
      });

      // Notify other group members
      this.broadcastToGroup(groupId, {
        type: 'user-joined',
        payload: {
          user: {
            id: user.id,
            username: user.username,
            peerId: user.peerId
          }
        }
      }, user.id);

      // If user has peerId, send peer discovery messages
      if (peerId) {
        this.handlePeerDiscovery(groupId, user);
      }

    } catch (error: any) {
      this.sendError(ws, error.message, 'Failed to join group');
    }
  }

  /**
   * Handle leaving a group
   */
  private handleLeaveGroup(ws: UserWebSocket, message: LeaveGroupMessage): void {
    const { userId } = message.payload;

    if (ws.userId !== userId) {
      this.sendError(ws, ErrorCodes.USER_NOT_FOUND, 'User ID mismatch');
      return;
    }

    this.performLeaveGroup(ws);
  }

  /**
   * Handle call requests between peers
   */
  private handleCallRequest(ws: UserWebSocket, message: CallRequestMessage): void {
    const { targetPeerId, fromPeerId, fromUsername } = message.payload;

    try {
      const targetUser = this.groupManager.getUserByPeerId(targetPeerId);
      
      if (!targetUser) {
        this.sendError(ws, ErrorCodes.PEER_NOT_FOUND, 'Target peer not found');
        return;
      }

      // Forward call request to target user
      this.sendMessage(targetUser.websocket, {
        type: 'incoming-call-request',
        payload: {
          fromPeerId,
          fromUsername
        }
      });

      logger.log(`Call request from ${fromUsername} (${fromPeerId}) to ${targetUser.username} (${targetPeerId})`);

    } catch (error: any) {
      this.sendError(ws, ErrorCodes.CONNECTION_ERROR, 'Failed to forward call request');
    }
  }

  /**
   * Handle call responses (accept/reject)
   */
  private handleCallResponse(ws: UserWebSocket, message: CallResponseMessage): void {
    const { accepted, fromPeerId, toPeerId } = message.payload;

    try {
      const fromUser = this.groupManager.getUserByPeerId(fromPeerId);
      
      if (!fromUser) {
        this.sendError(ws, ErrorCodes.PEER_NOT_FOUND, 'Caller peer not found');
        return;
      }

      // Forward response to the original caller
      this.sendMessage(fromUser.websocket, {
        type: 'call-response',
        payload: {
          accepted,
          fromPeerId: toPeerId, // Swap the peer IDs for the response
          toPeerId: fromPeerId
        }
      });

      logger.log(`Call ${accepted ? 'accepted' : 'rejected'} between ${fromPeerId} and ${toPeerId}`);

    } catch (error: any) {
      this.sendError(ws, ErrorCodes.CONNECTION_ERROR, 'Failed to forward call response');
    }
  }

  /**
   * Handle peer ID updates
   */
  private handleUpdatePeerId(ws: UserWebSocket, message: UpdatePeerIdMessage): void {
    const { peerId } = message.payload;

    if (!ws.userId) {
      this.sendError(ws, ErrorCodes.USER_NOT_FOUND, 'User not authenticated');
      return;
    }

    const success = this.groupManager.updateUserPeerId(ws.userId, peerId);
    
    if (success && ws.groupId) {
      const user = this.groupManager.getUser(ws.userId);
      if (user) {
        this.handlePeerDiscovery(ws.groupId, user);
      }
    }
  }

  /**
   * Handle peer discovery when a user updates their peer ID
   */
  private handlePeerDiscovery(groupId: string, user: any): void {
    if (!user.peerId) return;

    // Notify other group members about the new peer
    this.broadcastToGroup(groupId, {
      type: 'peer-joined',
      payload: {
        peerId: user.peerId,
        username: user.username
      }
    }, user.id);

    // Send existing peers to the new peer
    const existingPeers = this.groupManager.getGroupPeers(groupId);

    this.sendMessage(user.websocket, {
      type: 'existing-peers',
      payload: {
        peers: existingPeers
      }
    });
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(ws: UserWebSocket): void {
    logger.log(`WebSocket disconnected: ${ws.username || 'Unknown'} with userId: ${ws.userId}`);
    this.performLeaveGroup(ws);
  }

  /**
   * Perform leave group operations
   */
  private performLeaveGroup(ws: UserWebSocket): void {
    const { group, user } = this.groupManager.cleanupUser(ws);
    
    if (user && group) {
      // Notify other group members
      this.broadcastToGroup(group.id, {
        type: 'user-left',
        payload: {
          userId: user.id,
          username: user.username
        }
      }, user.id);
    }

    // Clear WebSocket user info
    ws.userId = undefined;
    ws.username = undefined;
    ws.groupId = undefined;
  }

  /**
   * Send message to a specific WebSocket
   */
  private sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Send error message to a WebSocket
   */
  private sendError(ws: WebSocket, code: string, message: string, details?: any): void {
    this.sendMessage(ws, {
      type: 'error',
      payload: {
        code,
        message,
        details
      }
    });
  }

  /**
   * Broadcast message to all members of a group
   */
  private broadcastToGroup(groupId: string, message: any, excludeUserId?: string): void {
    const members = this.groupManager.getGroupMembers(groupId);
    
    members.forEach(member => {
      if (member.id !== excludeUserId && member.websocket.readyState === WebSocket.OPEN) {
        this.sendMessage(member.websocket, message);
      }
    });
  }

  /**
   * Set up connection health monitoring
   */
  startHealthCheck(wss: any): void {
    const interval = setInterval(() => {
      wss.clients.forEach((ws: UserWebSocket) => {
        if (!ws.isAlive) {
          logger.log('Terminating inactive connection');
          this.handleDisconnection(ws);
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds

    // Clear interval on process exit
    process.on('SIGTERM', () => clearInterval(interval));
  }
}
