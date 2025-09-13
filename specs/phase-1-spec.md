# PeerShare POC - Phase 1 Specification

## Overview
Phase 1 focuses on delivering the absolute minimum viable features to validate the core concept of group-based P2P video calling. This phase establishes the foundation for user testing and technical validation.

**Duration**: 1 week  
**Team**: 2-3 developers  
**Goal**: Prove that group-based P2P calling works and users find it intuitive

## Phase 1 Scope

### Core Features (Must Have)
1. **Basic Group Creation & Joining**
2. **Simple P2P Video Calling (2 users max)**
3. **Basic Screen Sharing**
4. **Minimal UI for Core Workflow**

### Excluded from Phase 1
- Advanced UI/UX polish
- Error handling beyond basic cases
- Mobile responsiveness
- Production deployment setup
- Analytics or metrics collection
- Advanced WebRTC features (simulcast, etc.)

## Technical Implementation

### Architecture Overview
```
Frontend (React + TypeScript)
    ↕ (Websocket)
Backend (Express + Websocket + TypeScript)
    ↕ (WebRTC Signaling)
P2P Connection (Direct between browsers)
```

### Key Components

#### 1. Group Management (Day 1-2)
**Backend Implementation:**
```typescript
// In-memory storage (no database)
interface Group {
  id: string;
  name: string;
  createdAt: Date;
  members: Map<string, User>;
}

interface User {
  id: string;
  username: string;
  socketId: string;
  groupId: string | null;
}

class GroupManager {
  private groups = new Map<string, Group>();
  private users = new Map<string, User>();
  
  createGroup(name: string, creatorUsername: string, socketId: string): string
  joinGroup(groupId: string, username: string, socketId: string): boolean
  leaveGroup(userId: string): void
  getGroupMembers(groupId: string): User[]
}
```

**Frontend Implementation:**
```typescript
// Group creation form
interface CreateGroupForm {
  groupName: string;
  username: string;
}

// Group joining form
interface JoinGroupForm {
  username: string;
}

// Basic group context
interface GroupState {
  currentGroup: Group | null;
  currentUser: User | null;
  members: User[];
  isConnected: boolean;
}
```

#### 2. P2P Video Calling (Day 3-4)
**WebRTC Setup:**
```typescript
import { Peer, DataConnection, MediaConnection } from 'peerjs';

// PeerJS connection wrapper
class PeerManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private mediaConnection: MediaConnection | null = null;
  
  async initializePeer(userId: string): Promise<void>
  async startCall(remotePeerId: string): Promise<MediaConnection>
  async answerCall(call: MediaConnection): Promise<void>
  async getLocalMedia(): Promise<MediaStream>
  endCall(): void
  destroy(): void
}

// Call state management
interface CallState {
  isInCall: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peer: Peer | null;
  mediaConnection: MediaConnection | null;
  peerId: string | null;
}
```

#### 3. Screen Sharing (Day 4-5)
```typescript
// Screen sharing extension for PeerJS
class ScreenShareManager {
  private screenStream: MediaStream | null = null;
  private peerManager: PeerManager;
  
  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }
  
  async startScreenShare(): Promise<MediaStream>
  stopScreenShare(): void
  async replaceVideoTrack(newTrack: MediaStreamTrack): Promise<void>
  private async updatePeerConnection(): Promise<void>
}
```

#### 4. PeerJS Configuration
```typescript
// PeerJS configuration for custom signaling
interface PeerConfig {
  host: 'localhost', // Custom signaling server
  port: 3001,
  path: '/peerjs',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' }
    ]
  }
}

// Socket.IO integration for peer discovery
interface PeerSignaling {
  broadcastPeerId: (peerId: string, groupId: string) => void;
  requestCall: (targetPeerId: string, fromPeerId: string) => void;
  handleCallRequest: (fromPeerId: string, callback: (accept: boolean) => void) => void;
}
```

## User Stories for Phase 1

### US-P1-001: Create Basic Group
**Priority**: Critical  
**Estimate**: 4 hours

**Description**: As a user, I want to create a group with a simple form so that I can invite others to join.

**Acceptance Criteria**:
- Form with group name and username fields
- Generate unique group ID and invite URL
- Creator automatically joins the group
- Show group page with member list (just creator initially)

**Implementation Notes**:
- Use UUID for group ID
- Store in memory only (groups disappear when server restarts)
- No validation beyond required fields

### US-P1-002: Join Group via URL
**Priority**: Critical  
**Estimate**: 3 hours

**Description**: As a user, I want to join a group by clicking an invite link so that I can participate in the group.

**Acceptance Criteria**:
- Invite URL format: `/group/{groupId}`
- Username input form on group page
- Join group and see other online members
- Real-time member list updates

**Implementation Notes**:
- Socket.IO room management for groups
- Broadcast member join/leave events
- Handle duplicate usernames (append number)

### US-P1-003: Start P2P Video Call
**Priority**: Critical  
**Estimate**: 8 hours

**Description**: As a group member, I want to start a video call with another member so we can see and hear each other.

**Acceptance Criteria**:
- "Start Call" button visible when exactly 2 members online
- Automatic camera/microphone permission request
- Establish P2P connection using WebRTC
- Show local and remote video feeds
- Basic connection status indicator

**Implementation Notes**:
- Use PeerJS library for WebRTC abstraction with better TypeScript support
- Custom signaling via Socket.IO (not PeerJS cloud server)
- STUN servers: Google and Mozilla public servers
- Call initiation through PeerJS peer-to-peer connections
- No TURN servers in Phase 1 (P2P only)

### US-P1-004: Basic Screen Sharing
**Priority**: High  
**Estimate**: 6 hours

**Description**: As a call participant, I want to share my screen so the other person can see my desktop.

**Acceptance Criteria**:
- "Share Screen" button during active call
- Browser screen selection dialog
- Replace video feed with screen content
- "Stop Sharing" button to return to camera
- Screen sharing works for both participants

**Implementation Notes**:
- Use getDisplayMedia() API with PeerJS MediaConnection
- Replace video track using replaceTrack() method on RTCRtpSender
- Handle browser compatibility (Chrome/Firefox/Safari)
- Basic error handling for permission denied
- Update remote peer with new video track automatically

### US-P1-005: Basic Call Controls
**Priority**: High  
**Estimate**: 4 hours

**Description**: As a call participant, I want basic controls so I can manage my participation.

**Acceptance Criteria**:
- Mute/unmute audio button
- Enable/disable video button
- End call button
- Visual feedback for muted state
- Call ends for both participants when one leaves

**Implementation Notes**:
- Toggle MediaStreamTrack enabled property
- Visual indicators for muted/disabled states
- Cleanup peer connection on call end
- Return to group member list after call

### US-P1-006: Minimal UI Layout
**Priority**: Medium  
**Estimate**: 6 hours

**Description**: As a user, I want a clean, functional interface so I can focus on the core functionality.

**Acceptance Criteria**:
- Landing page with "Create Group" option
- Group page with member list and call button
- Call interface with video feeds and controls
- Basic responsive layout for desktop
- Clear navigation between states

**Implementation Notes**:
- Use Tailwind CSS for quick styling
- Component structure: Landing → Group → Call
- No fancy animations or transitions
- Focus on functionality over aesthetics

## Technical Milestones

### Day 1: Project Setup & Group Management Backend
- [ ] Initialize monorepo structure (client/server/shared)
- [ ] Set up TypeScript configurations
- [ ] Implement basic Express server with Socket.IO
- [ ] Create in-memory group management
- [ ] Basic Socket.IO event handlers

### Day 2: Frontend Foundation & Group UI
- [ ] Set up React + Vite + TypeScript
- [ ] Implement Socket.IO client connection
- [ ] Create group creation form
- [ ] Implement group joining flow
- [ ] Basic member list display

### Day 3: WebRTC P2P Connection
- [ ] Integrate PeerJS library with custom signaling
- [ ] Implement PeerJS initialization and peer ID management
- [ ] Set up call initiation and answering logic
- [ ] Handle MediaConnection events and streams
- [ ] Test P2P connection between two browsers

### Day 4: Video Calling & Screen Sharing
- [ ] Implement getUserMedia for camera/microphone
- [ ] Display local and remote video streams
- [ ] Add getDisplayMedia for screen sharing
- [ ] Screen sharing track replacement
- [ ] Basic error handling

### Day 5: Call Controls & Polish
- [ ] Implement mute/unmute functionality
- [ ] Add video enable/disable controls
- [ ] End call functionality
- [ ] UI polish and basic styling
- [ ] Cross-browser testing

## Environment Setup

### Development Environment
```bash
# Required software
Node.js 18.17+
npm 9+
Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

# Project initialization
npm init -y
mkdir client server shared
```

### Package.json (Root)
```json
{
  "name": "peer-share",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\" \"npm run peerjs:dev\"",
    "server:dev": "cd server && npm run dev",
    "client:dev": "cd client && npm run dev",
    "peerjs:dev": "peerjs --port 3001 --path /peerjs"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "peer": "^1.0.0"
  }
}
```

### Key Dependencies Update
**Frontend Dependencies:**
```json
{
  "dependencies": {
    "peerjs": "^1.5.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@types/peerjs": "^1.1.1"
  }
}
```

**Backend Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "peer": "^1.0.0"
  }
}
```

## Testing Strategy for Phase 1

### Manual Testing Scenarios
1. **Group Creation Flow**
   - Create group with valid name and username
   - Verify unique group URL generation
   - Test with empty/invalid inputs

2. **Group Joining Flow**
   - Join existing group with valid username
   - Test with non-existent group ID
   - Multiple users joining same group

3. **P2P Calling**
   - Two users in group start call
   - Test camera/microphone permissions
   - Verify bidirectional audio/video

4. **Screen Sharing**
   - Share screen during call
   - Switch between camera and screen
   - Test on different browsers

5. **Browser Compatibility**
   - Test on Chrome, Firefox, Safari
   - Test WebRTC feature detection
   - Verify graceful degradation

### Success Criteria for Phase 1
- [ ] Two users can create and join a group within 30 seconds
- [ ] P2P video call establishes successfully in >80% of attempts (same network)
- [ ] Screen sharing works in Chrome and Firefox
- [ ] Basic error messages for common failures
- [ ] No major crashes or broken states

## Known Phase 1 Limitations
- **Network Restrictions**: No TURN servers, so won't work behind strict NATs
- **Group Persistence**: Groups disappear when server restarts
- **Scalability**: In-memory storage, single server instance
- **Error Handling**: Basic error messages only
- **Security**: No authentication or input validation
- **Browser Support**: Limited to modern browsers only
- **Mobile**: Desktop-only experience

## Phase 1 Deliverables
1. **Working Application**: Functional P2P video calling within groups
2. **Source Code**: Complete TypeScript implementation
3. **Basic Documentation**: Setup and usage instructions
4. **Test Results**: Manual testing results and browser compatibility
5. **Demo Video**: 2-3 minute demonstration of core workflow
6. **User Feedback Form**: Simple form for collecting initial user impressions

## Next Phase Planning
After Phase 1 completion, evaluate:
- P2P connection success rates in real-world networks
- User feedback on group-based workflow
- Technical debt and refactoring needs
- Priority features for Phase 2 (TURN servers, better UI, error handling)

## PeerJS Implementation Example

### Basic PeerJS Setup
```typescript
// Frontend: PeerManager implementation
class PeerManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private mediaConnection: MediaConnection | null = null;

  async initializePeer(userId: string): Promise<void> {
    this.peer = new Peer(userId, {
      host: 'localhost',
      port: 3001,
      path: '/peerjs',
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun.services.mozilla.com' }
        ]
      }
    });

    this.peer.on('call', this.handleIncomingCall.bind(this));
  }

  async startCall(remotePeerId: string): Promise<MediaConnection> {
    if (!this.peer || !this.localStream) throw new Error('Peer not initialized');
    
    this.mediaConnection = this.peer.call(remotePeerId, this.localStream);
    this.setupCallHandlers(this.mediaConnection);
    return this.mediaConnection;
  }

  private async handleIncomingCall(call: MediaConnection): Promise<void> {
    this.mediaConnection = call;
    call.answer(this.localStream!);
    this.setupCallHandlers(call);
  }

  private setupCallHandlers(call: MediaConnection): void {
    call.on('stream', (remoteStream: MediaStream) => {
      // Handle remote stream - display in video element
      this.onRemoteStream?.(remoteStream);
    });

    call.on('close', () => {
      this.onCallEnd?.();
    });
  }
}
```

### Socket.IO Integration for Peer Discovery
```typescript
// Backend: Peer discovery via Socket.IO
io.on('connection', (socket) => {
  socket.on('join-group', ({ groupId, username, peerId }) => {
    socket.join(groupId);
    
    // Broadcast peer ID to other group members
    socket.to(groupId).emit('user-joined', { username, peerId });
    
    // Send existing peers to new user
    const existingPeers = getGroupPeers(groupId);
    socket.emit('existing-peers', existingPeers);
  });

  socket.on('call-request', ({ targetPeerId, fromPeerId }) => {
    // Relay call request to target peer
    socket.to(getSocketByPeerId(targetPeerId)).emit('incoming-call-request', {
      fromPeerId
    });
  });
});
```

This Phase 1 specification provides a concrete, achievable target that validates the core PeerShare concept while establishing a solid foundation for future development.
