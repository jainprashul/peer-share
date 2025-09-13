import type { 
  AllMessageTypes, 
  CreateGroupMessage, 
  JoinGroupMessage, 
  LeaveGroupMessage,
  CallRequestMessage,
  CallResponseMessage,
  UpdatePeerIdMessage
} from '@peer-share/shared';

export type WebSocketEventHandler = (message: AllMessageTypes) => void;

/**
 * WebSocketService handles communication with the PeerShare backend
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers = new Map<string, WebSocketEventHandler[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private serverUrl: string;

  constructor(serverUrl: string = 'ws://localhost:8081') {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected to', this.serverUrl);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as AllMessageTypes;
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server
   */
  send(message: AllMessageTypes): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Register an event handler for specific message types
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming messages and dispatch to appropriate handlers
   */
  private handleMessage(message: AllMessageTypes): void {
    console.log('Received message:', message.type, message);
    
    // Dispatch to specific type handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(message));
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Convenience methods for common operations

  /**
   * Create a new group
   */
  createGroup(groupName: string, username: string): void {
    const message: CreateGroupMessage = {
      type: 'create-group',
      payload: { groupName, username }
    };
    this.send(message);
  }

  /**
   * Join an existing group
   */
  joinGroup(groupId: string, username: string, peerId?: string): void {
    const message: JoinGroupMessage = {
      type: 'join-group',
      payload: { groupId, username, peerId }
    };
    this.send(message);
  }

  /**
   * Leave the current group
   */
  leaveGroup(userId: string): void {
    const message: LeaveGroupMessage = {
      type: 'leave-group',
      payload: { userId }
    };
    this.send(message);
  }

  /**
   * Send a call request to another peer
   */
  requestCall(targetPeerId: string, fromPeerId: string, fromUsername: string): void {
    const message: CallRequestMessage = {
      type: 'call-request',
      payload: { targetPeerId, fromPeerId, fromUsername }
    };
    this.send(message);
  }

  /**
   * Respond to a call request
   */
  respondToCall(accepted: boolean, fromPeerId: string, toPeerId: string): void {
    const message: CallResponseMessage = {
      type: 'call-response',
      payload: { accepted, fromPeerId, toPeerId }
    };
    this.send(message);
  }

  /**
   * Update peer ID for WebRTC signaling
   */
  updatePeerId(peerId: string): void {
    const message: UpdatePeerIdMessage = {
      type: 'update-peer-id',
      payload: { peerId }
    };
    this.send(message);
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
