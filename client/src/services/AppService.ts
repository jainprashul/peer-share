import store from '../store/store';
import { userActions } from '../store/context/userSlice';
import { webSocketService } from './WebSocketService';
import { peerJSService } from './PeerJSService';
import type { User, Group, ErrorMessage } from '@peer-share/shared';
import { utilityActions } from '../store/context/utilitySlice';
import { history } from '../navigations/history';

/**
 * AppService handles the main application logic and coordinates between services
 */
export class AppService {
  private isInitialized = false;

  constructor() {
    this.setupWebSocketHandlers();
    this.setupPeerJSHandlers();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      store.dispatch(utilityActions.setLoading(true));
      store.dispatch(utilityActions.setError(null));

      // Connect to WebSocket server
      await webSocketService.connect();
      store.dispatch(userActions.setConnected(true));

      this.isInitialized = true;
      console.log('AppService initialized');
    } catch (error) {
      console.error('Failed to initialize AppService:', error);
      store.dispatch(utilityActions.setError('Failed to connect to server'));
      throw error;
    } finally {
      store.dispatch(utilityActions.setLoading(false));
    }
  }

  /**
   * Create a new group
   */
  async createGroup(groupName: string, username: string): Promise<void> {
    try {
      store.dispatch(utilityActions.setLoading(true));
      store.dispatch(utilityActions.setError(null));

      // Send create group message
      webSocketService.createGroup(groupName, username);
    } catch (error) {
      console.error('Failed to create group:', error);
      store.dispatch(utilityActions.setError('Failed to create group'));
      throw error;
    } finally {
      store.dispatch(utilityActions.setLoading(false));
    }
  }

  /**
   * Join an existing group
   */
  async joinGroup(groupId: string, username: string): Promise<void> {
    try {
      store.dispatch(utilityActions.setLoading(true));
      store.dispatch(utilityActions.setError(null));

      // Initialize PeerJS first
      const peerId = await peerJSService.initializePeer(username);
      
      // Join group with peer ID
      webSocketService.joinGroup(groupId, username, peerId);
    } catch (error) {
      console.error('Failed to join group:', error);
      store.dispatch(utilityActions.setError('Failed to join group'));
      throw error;
    } finally {
      store.dispatch(utilityActions.setLoading(false));
    }
  }

  /**
   * Leave the current group
   */
  async leaveGroup(): Promise<void> {
    const state = store.getState();
    const currentUser = state.user.currentUser;

    if (currentUser) {
      webSocketService.leaveGroup(currentUser.id);
    }

    // Reset state
    store.dispatch(userActions.setCurrentUser(null));
    store.dispatch(userActions.setCurrentGroup(null));
    store.dispatch(userActions.setMembers([]));
    store.dispatch(userActions.setInCall(false));
    // store.dispatch(userActions.setCurrentPage('landing'));
    history.push('/');

    // Clean up PeerJS
    peerJSService.destroy();
  }

  /**
   * Start a call with another user
   */
  async startCall(targetUserId: string): Promise<void> {
    try {
      const state = store.getState();
      const targetUser = state.user.members.find(m => m.id === targetUserId);
      
      if (!targetUser || !targetUser.peerId) {
        throw new Error('Target user not found or not ready for calls');
      }

      store.dispatch(userActions.setConnecting(true));

      // Get local media
      const localStream = await peerJSService.getLocalMedia();
      store.dispatch(userActions.setLocalStream(localStream));

      // Start the call
      await peerJSService.startCall(targetUser.peerId);
      
      store.dispatch(userActions.setInCall(true));
      // store.dispatch(userActions.setCurrentPage('call'));
      history.push('/call');
    } catch (error) {
      console.error('Failed to start call:', error);
      store.dispatch(utilityActions.setError('Failed to start call'));
      throw error;
    } finally {
      store.dispatch(userActions.setConnecting(false));
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(): Promise<void> {
    try {
      store.dispatch(userActions.setConnecting(true));

      // Get local media if not already available
      let localStream = store.getState().user.localStream;
      if (!localStream) {
        localStream = await peerJSService.getLocalMedia();
        store.dispatch(userActions.setLocalStream(localStream));
      }

      // Answer the call
      await peerJSService.answerCall();
      
      store.dispatch(userActions.setInCall(true));
      // store.dispatch(userActions.setCurrentPage('call'));
      history.push('/call');
    } catch (error) {
      console.error('Failed to answer call:', error);
      store.dispatch(utilityActions.setError('Failed to answer call'));
      throw error;
    } finally {
      store.dispatch(userActions.setConnecting(false));
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    peerJSService.endCall();
    store.dispatch(userActions.setInCall(false));
    // store.dispatch(userActions.setCurrentPage('group'));
    history.push('/group');
    store.dispatch(userActions.setRemoteStream(null));
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    const isMuted = peerJSService.toggleMute();
    store.dispatch(userActions.setMuted(!isMuted));
  }

  /**
   * Toggle video state
   */
  toggleVideo(): void {
    const isVideoEnabled = peerJSService.toggleVideo();
    store.dispatch(userActions.setVideoEnabled(isVideoEnabled));
  }

  /**
   * Toggle screen sharing
   */
  async toggleScreenShare(): Promise<void> {
    try {
      const state = store.getState();
      
      if (state.user.isScreenSharing) {
        await peerJSService.stopScreenShare();
        store.dispatch(userActions.setScreenSharing(false));
      } else {
        await peerJSService.startScreenShare();
        store.dispatch(userActions.setScreenSharing(true));
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      store.dispatch(utilityActions.setError('Failed to toggle screen share'));
      throw error;
    }
  }

  /**
   * Set up WebSocket message handlers
   */
  private setupWebSocketHandlers(): void {
    // Group created
    webSocketService.on('group-created', (message) => {
      if (message.type !== 'group-created') return;
      const { groupId, groupName, user } = message.payload;
      
      const group: Group = {
        id: groupId,
        name: groupName,
        createdAt: new Date(),
        members: new Map()
      };
      
      const currentUser: User = {
        id: user.id,
        username: user.username,
        groupId: groupId,
        peerId: undefined
      };

      store.dispatch(userActions.setCurrentUser(currentUser));
      store.dispatch(userActions.setCurrentGroup(group));
      store.dispatch(userActions.setMembers([currentUser]));
      // store.dispatch(userActions.setCurrentPage('group'));
      history.push(`/group/${groupId}`);
    });

    // Group joined
    webSocketService.on('group-joined', (message) => {
      if (message.type !== 'group-joined') return;
      const { groupId, groupName, user, members } = message.payload;
      
      const group: Group = {
        id: groupId,
        name: groupName,
        createdAt: new Date(),
        members: new Map()
      };
      
      const currentUser: User = {
        id: user.id,
        username: user.username,
        groupId: groupId,
        peerId: undefined
      };

      const memberList: User[] = members.map((m: any) => ({
        id: m.id,
        username: m.username,
        groupId: groupId,
        peerId: m.peerId
      }));

      store.dispatch(userActions.setCurrentUser(currentUser));
      store.dispatch(userActions.setCurrentGroup(group));
      store.dispatch(userActions.setMembers([currentUser, ...memberList]));
      // store.dispatch(userActions.setCurrentPage('group'));
      history.push(`/group/${groupId}`);
    });

    // User joined
    webSocketService.on('user-joined', (message) => {
      if (message.type !== 'user-joined') return;
      const { user } = message.payload;
      const newUser: User = {
        id: user.id,
        username: user.username,
        groupId: store.getState().user.currentGroup?.id || null,
        peerId: user.peerId
      };
      
      store.dispatch(userActions.addMember(newUser));
    });

    // User left
    webSocketService.on('user-left', (message) => {
      if (message.type !== 'user-left') return;
      const { userId } = message.payload;
      store.dispatch(userActions.removeMember(userId));
    });

    // Peer joined (for call readiness)
    webSocketService.on('peer-joined', (message) => {
      if (message.type !== 'peer-joined') return;
      const { peerId, username } = message.payload;
      
      // Update member with peer ID
      const state = store.getState();
      const updatedMembers = state.user.members.map((member: User) => 
        member.username === username 
          ? { ...member, peerId }
          : member
      );
      
      store.dispatch(userActions.setMembers(updatedMembers));
    });

    // Existing peers
    webSocketService.on('existing-peers', (message) => {
      if (message.type !== 'existing-peers') return;
      const { peers } = message.payload;
      
      // Update members with peer IDs
      const state = store.getState();
      const updatedMembers = state.user.members.map((member: User) => {
        const peer = peers.find((p: any) => p.username === member.username);
        return peer ? { ...member, peerId: peer.peerId } : member;
      });
      
      store.dispatch(userActions.setMembers(updatedMembers));
    });

    // Incoming call request
    webSocketService.on('incoming-call-request', (message) => {
      if (message.type !== 'incoming-call-request') return;
      const { fromPeerId, fromUsername } = message.payload;
      
      // Show call notification (you might want to add a modal for this)
      const shouldAnswer = window.confirm(`Incoming call from ${fromUsername}. Answer?`);
      
      if (shouldAnswer) {
        this.answerCall();
      } else {
        // Reject the call
        const state = store.getState();
        const currentUser = state.user.currentUser;
        if (currentUser && currentUser.peerId) {
          webSocketService.respondToCall(false, fromPeerId, currentUser.peerId);
        }
      }
    });

    // Error handling
    webSocketService.on('error', (message) => {
      if (message.type !== 'error') return;
      const { code, message: errorMessage } = message.payload;
      console.error('WebSocket error:', code, errorMessage);
      store.dispatch(utilityActions.setError(errorMessage));
    });

    // Connection status
    webSocketService.on('*', (message) => {
      if (message.type === 'error') {
        const errorMessage = message as ErrorMessage;
        store.dispatch(utilityActions.setError(errorMessage.payload.message));
      }
    });
  }

  /**
   * Set up PeerJS event handlers
   */
  private setupPeerJSHandlers(): void {
    peerJSService.setEvents({
      onLocalStream: (stream: MediaStream) => {
        store.dispatch(userActions.setLocalStream(stream));
      },
      
      onRemoteStream: (stream: MediaStream) => {
        store.dispatch(userActions.setRemoteStream(stream));
      },
      
      onCallStarted: () => {
        store.dispatch(userActions.setInCall(true));
        store.dispatch(userActions.setConnecting(false));
      },
      
      onCallEnded: () => {
        store.dispatch(userActions.setInCall(false));
        // store.dispatch(userActions.setCurrentPage('group'));
        history.push('/group');
        store.dispatch(userActions.setRemoteStream(null));
      },
      
      onError: (error: Error) => {
        console.error('PeerJS error:', error);
        store.dispatch(utilityActions.setError(error.message));
      },
      
      onIncomingCall: (fromPeerId: string, fromUsername: string) => {
        // This is handled by WebSocket service
        console.log('Incoming call from:', fromUsername, fromPeerId);
      }
    });
  }
}

// Export singleton instance
export const appService = new AppService();
