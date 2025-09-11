# PeerShare POC - Phase 2 Specification

## Overview
Phase 2 builds upon the successful Phase 1 foundation by addressing its key limitations and adding production-ready features. This phase transforms the POC into a more robust application that can handle real-world network conditions and scale to support multiple users per call.

**Duration**: 2-3 weeks  
**Team**: 3-4 developers  
**Goal**: Create a production-ready MVP that works reliably across different network conditions and supports multi-user calls

## Phase 2 Scope

### Core Enhancements (Must Have)
1. **TURN Server Integration** - Support calls behind restrictive NATs
2. **SFU Architecture** - Enable 3+ user group calls
3. **Advanced Error Handling** - Robust connection failure recovery
4. **Improved UI/UX** - Professional interface with better user feedback
5. **Mobile Responsiveness** - Support for tablet and mobile devices
6. **Call Recording** - Basic session recording functionality

### Secondary Features (Should Have)
7. **User Authentication** - Basic OAuth integration
8. **Group Persistence** - Database storage for groups
9. **Connection Quality Monitoring** - Real-time network diagnostics
10. **Advanced Screen Sharing** - Multiple screen share options

### Nice to Have Features
11. **Push Notifications** - Call notifications when not in app
12. **Chat Integration** - Basic text chat during calls
13. **Call History** - Session history and analytics

## Technical Architecture Evolution

### Phase 2 Architecture
```
Frontend (React + TypeScript + PeerJS)
    ↕ (Socket.IO + REST API)
Backend (Express + Socket.IO + TypeScript)
    ↕ (Database + Redis)
SFU Server (mediasoup + TypeScript)
    ↕ (WebRTC Media Routing)
TURN Servers (coturn cluster)
    ↕ (NAT Traversal)
Authentication (OAuth + JWT)
```

## Core Components Implementation

### 1. TURN Server Integration (Week 1)

#### TURN Server Setup
```typescript
// Enhanced WebRTC configuration
interface RTCConfiguration {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize: number;
  iceTransportPolicy: 'all' | 'relay';
}

class TurnServerManager {
  private turnCredentials: TurnCredentials | null = null;
  
  async getTurnCredentials(): Promise<RTCIceServer[]> {
    // Get TURN credentials from backend
    const response = await fetch('/api/turn-credentials');
    const credentials = await response.json();
    
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' },
      {
        urls: credentials.urls,
        username: credentials.username,
        credential: credentials.credential
      }
    ];
  }
  
  async refreshCredentials(): Promise<void> {
    // Refresh TURN credentials before expiry
  }
}
```

#### Backend TURN Credential Management
```typescript
import crypto from 'crypto';

class TurnCredentialService {
  private turnSecret: string;
  private turnServers: string[];
  
  generateCredentials(username: string, ttl: number = 3600): TurnCredentials {
    const timestamp = Math.floor(Date.now() / 1000) + ttl;
    const turnUsername = `${timestamp}:${username}`;
    const turnCredential = crypto
      .createHmac('sha1', this.turnSecret)
      .update(turnUsername)
      .digest('base64');
    
    return {
      urls: this.turnServers,
      username: turnUsername,
      credential: turnCredential,
      ttl: ttl
    };
  }
}
```

### 2. SFU Architecture (Week 1-2)

#### mediasoup Integration
```typescript
import { Router, WebRtcTransport, Producer, Consumer } from 'mediasoup/node/lib/types';

class SFUManager {
  private router: Router | null = null;
  private transports = new Map<string, WebRtcTransport>();
  private producers = new Map<string, Producer>();
  private consumers = new Map<string, Consumer>();
  
  async initializeRouter(): Promise<void> {
    // Initialize mediasoup router with codecs
  }
  
  async createWebRtcTransport(userId: string): Promise<WebRtcTransportOptions> {
    // Create transport for user
  }
  
  async handleProducer(userId: string, transportId: string, rtpParameters: any): Promise<string> {
    // Handle incoming media stream
  }
  
  async handleConsumer(userId: string, producerId: string): Promise<ConsumerOptions> {
    // Create consumer for user to receive media
  }
  
  async handleScreenShare(userId: string, rtpParameters: any): Promise<void> {
    // Handle screen sharing producer
  }
}
```

#### Call Routing Logic
```typescript
interface CallSession {
  id: string;
  groupId: string;
  participants: Map<string, Participant>;
  type: 'p2p' | 'sfu';
  createdAt: Date;
  isRecording: boolean;
}

class CallRouter {
  private sessions = new Map<string, CallSession>();
  private sfuManager: SFUManager;
  private peerManager: PeerManager;
  
  async initiateCall(groupId: string, participants: string[]): Promise<CallSession> {
    const session = this.createSession(groupId, participants);
    
    if (participants.length <= 2) {
      return this.setupP2PCall(session);
    } else {
      return this.setupSFUCall(session);
    }
  }
  
  async upgradeToSFU(sessionId: string): Promise<void> {
    // Migrate P2P call to SFU when third participant joins
  }
}
```

### 3. Enhanced Error Handling (Week 1)

#### Connection Recovery System
```typescript
interface ConnectionState {
  status: 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'closed';
  quality: 'excellent' | 'good' | 'poor' | 'very-poor';
  lastConnected: Date;
  reconnectAttempts: number;
}

class ConnectionManager {
  private state: ConnectionState;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  
  async handleConnectionFailure(error: Error): Promise<void> {
    this.state.status = 'reconnecting';
    this.state.reconnectAttempts++;
    
    if (this.state.reconnectAttempts <= this.maxReconnectAttempts) {
      await this.attemptReconnection();
    } else {
      await this.handlePermanentFailure();
    }
  }
  
  private async attemptReconnection(): Promise<void> {
    const backoffDelay = Math.min(1000 * Math.pow(2, this.state.reconnectAttempts), 30000);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.reestablishConnection();
        this.state.status = 'connected';
        this.state.reconnectAttempts = 0;
      } catch (error) {
        await this.handleConnectionFailure(error);
      }
    }, backoffDelay);
  }
}
```

#### Error User Interface
```typescript
interface ErrorState {
  type: 'network' | 'permission' | 'browser' | 'server';
  message: string;
  isRecoverable: boolean;
  suggestedActions: string[];
}

class ErrorHandler {
  static getErrorInfo(error: Error): ErrorState {
    // Categorize errors and provide user-friendly messages
    if (error.name === 'NotAllowedError') {
      return {
        type: 'permission',
        message: 'Camera or microphone access denied',
        isRecoverable: true,
        suggestedActions: [
          'Click the camera icon in your browser address bar',
          'Select "Allow" for camera and microphone',
          'Refresh the page and try again'
        ]
      };
    }
    
    // Handle other error types...
  }
}
```

### 4. Improved UI/UX (Week 2)

#### Professional UI Components
```typescript
// Call interface with advanced controls
interface CallControlsProps {
  isInCall: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'very-poor';
  participantCount: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onStartRecording: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  isInCall,
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  connectionQuality,
  participantCount,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onStartRecording
}) => {
  return (
    <div className="call-controls">
      <div className="connection-indicator">
        <ConnectionQualityIndicator quality={connectionQuality} />
        <span>{participantCount} participants</span>
      </div>
      
      <div className="control-buttons">
        <ControlButton
          icon={isMuted ? MicOffIcon : MicOnIcon}
          active={!isMuted}
          onClick={onToggleMute}
          tooltip="Toggle microphone"
        />
        <ControlButton
          icon={isVideoEnabled ? VideoOnIcon : VideoOffIcon}
          active={isVideoEnabled}
          onClick={onToggleVideo}
          tooltip="Toggle camera"
        />
        <ControlButton
          icon={ScreenShareIcon}
          active={isScreenSharing}
          onClick={onToggleScreenShare}
          tooltip="Share screen"
        />
        <RecordButton onStartRecording={onStartRecording} />
        <EndCallButton onClick={onEndCall} />
      </div>
    </div>
  );
};
```

#### Responsive Grid Layout
```typescript
interface ParticipantGridProps {
  participants: Participant[];
  screenShareStream?: MediaStream;
  layout: 'grid' | 'spotlight' | 'sidebar';
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  screenShareStream,
  layout
}) => {
  const gridCols = useMemo(() => {
    const count = participants.length;
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  }, [participants.length]);

  return (
    <div className={`participant-grid ${gridCols}`}>
      {screenShareStream && (
        <div className="screen-share-container">
          <VideoStream stream={screenShareStream} />
        </div>
      )}
      {participants.map(participant => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          showControls={layout !== 'spotlight'}
        />
      ))}
    </div>
  );
};
```

### 5. Mobile Responsiveness (Week 2)

#### Touch-Optimized Controls
```typescript
const MobileCallControls: React.FC<CallControlsProps> = (props) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="mobile-call-controls">
      <div className="primary-controls">
        <TouchButton
          size="large"
          variant={props.isMuted ? 'danger' : 'primary'}
          onClick={props.onToggleMute}
        >
          {props.isMuted ? <MicOffIcon /> : <MicOnIcon />}
        </TouchButton>
        
        <TouchButton
          size="large"
          variant="danger"
          onClick={props.onEndCall}
        >
          <EndCallIcon />
        </TouchButton>
        
        <TouchButton
          size="large"
          variant={props.isVideoEnabled ? 'primary' : 'secondary'}
          onClick={props.onToggleVideo}
        >
          {props.isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
        </TouchButton>
      </div>
      
      {showAdvanced && (
        <div className="advanced-controls">
          <TouchButton onClick={props.onToggleScreenShare}>
            <ScreenShareIcon />
          </TouchButton>
          <TouchButton onClick={() => props.onStartRecording()}>
            <RecordIcon />
          </TouchButton>
        </div>
      )}
    </div>
  );
};
```

### 6. Basic Recording (Week 2-3)

#### Server-Side Recording
```typescript
import ffmpeg from 'fluent-ffmpeg';

class RecordingManager {
  private activeRecordings = new Map<string, RecordingSession>();
  
  async startRecording(sessionId: string): Promise<string> {
    const session = this.createRecordingSession(sessionId);
    
    // Set up mediasoup recording
    const recording = await this.sfuManager.startRecording(sessionId, {
      video: { codec: 'h264', bitrate: 2000000 },
      audio: { codec: 'opus', bitrate: 128000 }
    });
    
    session.mediaRecording = recording;
    this.activeRecordings.set(sessionId, session);
    
    return session.id;
  }
  
  async stopRecording(sessionId: string): Promise<string> {
    const session = this.activeRecordings.get(sessionId);
    if (!session) throw new Error('Recording not found');
    
    await session.mediaRecording.stop();
    
    // Process with ffmpeg
    const outputPath = await this.processRecording(session);
    
    // Upload to storage
    const downloadUrl = await this.uploadRecording(outputPath);
    
    return downloadUrl;
  }
  
  private async processRecording(session: RecordingSession): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(session.inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .on('end', () => resolve(session.outputPath))
        .on('error', reject)
        .save(session.outputPath);
    });
  }
}
```

## User Stories for Phase 2

### US-P2-001: TURN Server Support
**Priority**: Critical  
**Estimate**: 16 hours

**Description**: As a user behind a restrictive NAT/firewall, I want calls to work reliably so that I can participate regardless of my network setup.

**Acceptance Criteria**:
- Automatic TURN server fallback when P2P fails
- Dynamic TURN credential generation with TTL
- Connection success rate >95% across different network conditions
- Graceful degradation messaging for users

### US-P2-002: Multi-User SFU Calls
**Priority**: Critical  
**Estimate**: 24 hours

**Description**: As a group member, I want to have calls with 3+ participants so that our entire team can collaborate together.

**Acceptance Criteria**:
- Support for 3-8 participants per call
- Automatic P2P to SFU migration when needed
- Participant grid layout with responsive design
- Individual participant controls (mute, video toggle)

### US-P2-003: Advanced Error Handling
**Priority**: High  
**Estimate**: 12 hours

**Description**: As a user, I want clear feedback and recovery options when things go wrong so that I can resolve issues quickly.

**Acceptance Criteria**:
- Categorized error messages with suggested actions
- Automatic reconnection with exponential backoff
- Connection quality indicators and warnings
- Network diagnostics and troubleshooting guide

### US-P2-004: Professional UI/UX
**Priority**: High  
**Estimate**: 20 hours

**Description**: As a user, I want a polished, professional interface so that I feel confident using this for work meetings.

**Acceptance Criteria**:
- Modern, clean design with consistent branding
- Responsive layout for desktop, tablet, and mobile
- Smooth animations and transitions
- Accessibility compliance (WCAG 2.1 AA)

### US-P2-005: Basic Recording
**Priority**: Medium  
**Estimate**: 18 hours

**Description**: As a group moderator, I want to record calls so that absent members can review the content later.

**Acceptance Criteria**:
- Server-side recording of audio, video, and screen shares
- MP4 output with configurable quality settings
- Secure download links with expiration
- Recording consent flow for all participants

### US-P2-006: User Authentication
**Priority**: Medium  
**Estimate**: 14 hours

**Description**: As a user, I want to sign in with my existing accounts so that I can access persistent features and history.

**Acceptance Criteria**:
- OAuth integration with Google, GitHub, and Microsoft
- JWT-based session management
- User profile with preferences
- Guest access still available for quick sessions

### US-P2-007: Group Persistence
**Priority**: Medium  
**Estimate**: 16 hours

**Description**: As a group creator, I want my groups to persist between sessions so that my team can have a permanent collaboration space.

**Acceptance Criteria**:
- PostgreSQL database for group storage
- Group member management and permissions
- Group settings and customization options
- Group invite link management

### US-P2-008: Connection Quality Monitoring
**Priority**: Medium  
**Estimate**: 10 hours

**Description**: As a user, I want to see connection quality information so that I can troubleshoot issues and optimize my setup.

**Acceptance Criteria**:
- Real-time connection quality indicators
- Network statistics (latency, bandwidth, packet loss)
- Automatic quality adjustments based on conditions
- Connection troubleshooting suggestions

## Technical Milestones

### Week 1: Infrastructure & Core Enhancements
**Days 1-2: TURN Server Integration**
- [ ] Set up coturn server with authentication
- [ ] Implement TURN credential generation API
- [ ] Update PeerJS configuration with TURN servers
- [ ] Test connection fallback mechanisms

**Days 3-4: SFU Foundation**
- [ ] Set up mediasoup server infrastructure
- [ ] Implement basic SFU routing logic
- [ ] Create WebRTC transport management
- [ ] Test multi-user call establishment

**Day 5: Error Handling**
- [ ] Implement connection state management
- [ ] Add automatic reconnection logic
- [ ] Create error categorization system
- [ ] Build user-friendly error messages

### Week 2: UI/UX & Mobile
**Days 1-2: Professional UI**
- [ ] Design system implementation with Tailwind
- [ ] Advanced call controls and participant grid
- [ ] Connection quality indicators
- [ ] Smooth animations and transitions

**Days 3-4: Mobile Responsiveness**
- [ ] Touch-optimized controls for mobile
- [ ] Responsive participant layouts
- [ ] Mobile-specific gestures and interactions
- [ ] Cross-device testing

**Day 5: Integration Testing**
- [ ] End-to-end testing across devices
- [ ] Performance optimization
- [ ] Bug fixes and polish

### Week 3: Advanced Features
**Days 1-2: Recording System**
- [ ] Server-side recording implementation
- [ ] ffmpeg processing pipeline
- [ ] Storage and download management
- [ ] Recording consent and controls

**Days 3-4: Authentication & Persistence**
- [ ] OAuth provider integration
- [ ] Database schema and models
- [ ] Group management API
- [ ] User profile system

**Day 5: Final Polish**
- [ ] Connection monitoring implementation
- [ ] Performance optimizations
- [ ] Security hardening
- [ ] Documentation updates

## Testing Strategy

### Automated Testing
```typescript
// Integration tests for SFU functionality
describe('SFU Call Management', () => {
  test('should upgrade P2P to SFU when third participant joins', async () => {
    const session = await callRouter.initiateCall('group1', ['user1', 'user2']);
    expect(session.type).toBe('p2p');
    
    await callRouter.addParticipant(session.id, 'user3');
    expect(session.type).toBe('sfu');
  });
  
  test('should handle participant disconnect gracefully', async () => {
    const session = await callRouter.initiateCall('group1', ['user1', 'user2', 'user3']);
    await callRouter.removeParticipant(session.id, 'user2');
    
    expect(session.participants.size).toBe(2);
    expect(session.type).toBe('sfu'); // Should remain SFU
  });
});
```

### Load Testing
- Test with 8 concurrent participants per call
- Multiple simultaneous calls per server
- TURN server capacity testing
- Database performance under load

### Cross-Platform Testing
- Desktop browsers: Chrome, Firefox, Safari, Edge
- Mobile browsers: iOS Safari, Android Chrome
- Network conditions: 3G, 4G, WiFi, restricted corporate networks
- Different NAT configurations

## Production Deployment

### Infrastructure Requirements
```yaml
# Docker Compose for Phase 2
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/peershare
      - REDIS_URL=redis://redis:6379
      - TURN_SECRET=your-turn-secret
  
  sfu:
    build: ./sfu
    ports:
      - "3001:3001"
    
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: peershare
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
  
  redis:
    image: redis:7-alpine
  
  turn:
    image: coturn/coturn
    ports:
      - "3478:3478"
      - "3478:3478/udp"
    environment:
      - TURN_SECRET=your-turn-secret
```

### Environment Configuration
```typescript
interface Phase2Config {
  database: {
    url: string;
    maxConnections: number;
  };
  redis: {
    url: string;
    keyPrefix: string;
  };
  turn: {
    servers: string[];
    secret: string;
    ttl: number;
  };
  sfu: {
    port: number;
    maxParticipants: number;
    codecs: CodecConfig[];
  };
  recording: {
    storageProvider: 's3' | 'local';
    maxDuration: number;
    quality: 'low' | 'medium' | 'high';
  };
}
```

## Success Metrics for Phase 2

### Technical Metrics
- [ ] Call success rate >95% across all network conditions
- [ ] P2P to SFU migration completes in <3 seconds
- [ ] Page load time <2 seconds on 3G networks
- [ ] Support 8 concurrent participants with <500ms latency
- [ ] Recording processing time <2x call duration

### User Experience Metrics
- [ ] User onboarding completion rate >80%
- [ ] Average time to join call <45 seconds
- [ ] Mobile user engagement >60% of desktop
- [ ] Error recovery success rate >90%
- [ ] User satisfaction score >4.0/5.0

### Business Metrics
- [ ] User retention rate >70% after 1 week
- [ ] Average session duration >15 minutes
- [ ] Group creation rate >50% of new users
- [ ] Recording feature adoption >30% of calls

## Phase 2 Deliverables

1. **Production-Ready Application**: Scalable, reliable video calling platform
2. **SFU Infrastructure**: Multi-user call support with mediasoup
3. **TURN Server Deployment**: Reliable connectivity across network conditions
4. **Professional UI/UX**: Polished interface with mobile support
5. **Recording System**: Server-side call recording with secure storage
6. **Authentication System**: OAuth integration with user management
7. **Database Schema**: Persistent group and user data storage
8. **Monitoring & Analytics**: Connection quality and usage metrics
9. **Deployment Guide**: Production deployment documentation
10. **API Documentation**: Complete API reference for future integrations

## Transition to Phase 3

After Phase 2 completion, the platform will be ready for:
- **Advanced Features**: Chat integration, file sharing, calendar integration
- **Enterprise Features**: SSO, advanced permissions, audit logs
- **Scale Optimization**: CDN integration, multi-region deployment
- **Mobile Apps**: Native iOS and Android applications
- **API Platform**: Public API for third-party integrations

Phase 2 establishes PeerShare as a robust, production-ready video calling platform that can compete with established solutions while maintaining its unique group-based approach and P2P performance advantages.
