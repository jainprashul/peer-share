# PRD: PeerShare POC - Minimal Group-Based P2P Video Calling

## 1. Product overview

### 1.1 Document title and version
- PRD: PeerShare POC - Minimal Group-Based P2P Video Calling
- Version: 1.0 (POC)

### 1.2 Product summary
PeerShare POC is a simplified proof-of-concept application that validates the core concept of group-based peer-to-peer video calling with screen sharing. The POC focuses on essential WebRTC functionality within a basic group structure, allowing users to create simple groups, join voice channels, and establish P2P connections with screen sharing capabilities.

The POC targets small development teams (2-5 members) who need to validate the technical feasibility and user experience of group-based P2P collaboration. This minimal version proves the concept before investing in full SFU infrastructure, advanced UI, or complex permission systems.

## 2. Goals

### 2.1 Business goals
- Validate P2P WebRTC connectivity and reliability in real-world networks
- Test user adoption of group-based collaboration model vs traditional room-based approach
- Measure screen sharing quality and performance across different devices
- Gather feedback on core UX patterns for group navigation and call initiation

### 2.2 User goals
- Create simple groups and invite team members
- Join voice channels and establish P2P video calls within 30 seconds
- Share screens with acceptable quality (≥10fps) during calls
- Experience seamless group-based workflow for team collaboration

### 2.3 Non-goals
- SFU infrastructure (limit to P2P only, max 2 participants per call)
- Advanced authentication (simple username-based access)
- Recording functionality
- Mobile applications
- Advanced UI/UX polish
- Production-grade scalability
- TURN server deployment (STUN only)

## 3. User personas

### 3.1 Key user types
- Small development teams (2-5 members)
- Early adopters willing to test new collaboration tools
- Technical users comfortable with beta software

### 3.2 Basic persona details
- **Small Dev Teams**: 2-5 person development teams who need quick screen sharing for code reviews and pair programming sessions
- **Beta Testers**: Technical early adopters who provide feedback on new collaboration tools and workflows

### 3.3 Role-based access
- **Group Creator**: Creates group and can invite members (basic admin)
- **Group Members**: Can join voice channels and participate in calls
- **Guests**: Join via invite links with same functionality as members (no distinction in POC)

## 4. Functional requirements

- **Basic Group Management** (Priority: High)
  - Simple group creation with unique invite links
  - Single voice channel per group (no text channels in POC)
  - Basic member list showing online/offline status

- **WebRTC P2P Connections** (Priority: High)
  - Direct peer-to-peer video and audio for 1:1 calls only
  - STUN server integration for basic NAT traversal
  - Simple connection establishment without TURN fallback
  - Basic connection quality indicators

- **Screen Sharing** (Priority: High)
  - Browser-based `getDisplayMedia()` for desktop/application sharing
  - Single screen share per call (no simultaneous sharing)
  - Basic quality controls (resolution selection)

- **Minimal Signaling** (Priority: High)
  - WebSocket signaling for offer/answer exchange
  - Basic ICE candidate sharing
  - Simple room joining/leaving messages

- **Basic Web Interface** (Priority: Medium)
  - React web application with minimal styling
  - Group creation and joining interface
  - Simple voice channel with participant list
  - Basic call controls (mute, camera, screen share, leave)

## 5. User experience

### 5.1 Entry points & first-time user flow
- Direct web access with simple group creation (enter username only)
- Share invite links via copy/paste
- No signup required - username-based identification only

### 5.2 Core experience
- **Group Creation**: User enters group name and username, gets shareable invite link
  - Minimal form with just group name and personal username fields
- **Joining**: Users click invite link, enter their username, and see group voice channel
  - Simple landing page with username input and "Join Group" button
- **Voice Channel**: Single voice channel shows online members and "Join Call" button
  - Basic participant list with online indicators and single call button
- **P2P Call**: Two users can connect directly with video, audio, and screen sharing
  - Simple call interface with basic controls and connection status
- **Screen Sharing**: One-click screen sharing with source selection
  - Browser native screen selection with basic start/stop controls

### 5.3 Advanced features & edge cases
- Basic error handling for connection failures
- Simple reconnection on network interruption
- Basic browser compatibility detection

### 5.4 UI/UX highlights
- Minimal, functional interface focused on core workflow
- Clear connection status indicators
- Simple, intuitive call controls
- Basic responsive design for desktop browsers

## 6. Narrative

Sarah and Mike are developers on a small team who need to quickly review code together. Sarah creates a PeerShare group called "Dev Team" and shares the invite link with Mike. Mike clicks the link, enters his name, and immediately sees Sarah online in the voice channel. With one click, they start a P2P video call, and Sarah shares her screen to show the code changes. The simple interface lets them focus on collaboration without complex setup or navigation, proving that group-based P2P calling can work seamlessly for small teams.

## 7. Success metrics

### 7.1 User-centric metrics
- P2P connection success rate: target >70% without TURN servers
- Time to establish call: target <45 seconds from group join
- Screen sharing activation rate: measure user engagement with feature
- Session duration: validate if users find value in extended collaboration

### 7.2 Business metrics
- Group creation rate and invite sharing patterns
- User retention over 1-week period
- Feedback quality and feature request patterns

### 7.3 Technical metrics
- WebRTC connection establishment success rate
- Screen sharing frame rate and quality measurements
- Browser compatibility and error rates
- Network condition impact on call quality

## 8. Technical considerations

### 8.1 Integration points
- WebRTC browser APIs: getUserMedia, getDisplayMedia, RTCPeerConnection
- Basic WebSocket server for signaling (Node.js + Socket.IO)
- STUN servers for NAT traversal (public STUN servers only)
- Simple in-memory state management (no database)

### 8.2 Data storage & privacy
- No persistent data storage (groups exist only while users are online)
- In-transit encryption via WebRTC DTLS-SRTP
- No user data collection beyond basic usage analytics
- Temporary session-based group membership

### 8.3 Scalability & performance
- Single server deployment (no horizontal scaling)
- In-memory group and user state management
- Basic rate limiting for signaling messages
- Simple static file serving for web application

### 8.4 Potential challenges
- P2P connection failures in restrictive networks (no TURN fallback)
- Browser compatibility differences for WebRTC APIs
- Screen sharing performance on lower-end devices
- Signaling server reliability with single point of failure

## 9. Milestones & sequencing

### 9.1 Project estimate
- Small: 3-4 weeks for functional POC

### 9.2 Team size & composition
- Minimal Team: 2-3 total people
  - 1 Full-stack developer (Node.js, React, WebRTC)
  - 1 Frontend developer (React, WebRTC APIs)
  - Optional: 1 Product person for user testing

### 9.3 Suggested phases
- **Phase 1**: Basic Infrastructure (1 week)
  - Key deliverables: WebSocket signaling server, basic React app, group creation/joining
- **Phase 2**: P2P Calling (1.5 weeks)
  - Key deliverables: WebRTC P2P connections, video/audio calling, basic UI
- **Phase 3**: Screen Sharing & Polish (1 week)
  - Key deliverables: getDisplayMedia integration, call controls, basic error handling

## 10. User stories

### 10.1. Create basic group
- **ID**: POC-US-001
- **Description**: As a user, I want to create a simple group so that I can invite my teammates for P2P collaboration
- **Acceptance criteria**:
  - Group creation form with group name and username fields
  - Generate unique invite link immediately after creation
  - Group creator becomes online in the voice channel
  - Invite link can be copied and shared via any method

### 10.2. Join group via invite link
- **ID**: POC-US-002
- **Description**: As a user, I want to join a group through an invite link so that I can participate in team calls
- **Acceptance criteria**:
  - Invite link opens landing page with username input
  - Successful join shows voice channel with online members
  - Username appears in member list for other participants
  - Basic error handling for invalid or expired links

### 10.3. Establish P2P video call
- **ID**: POC-US-003
- **Description**: As a group member, I want to start a P2P video call with another member so that we can collaborate face-to-face
- **Acceptance criteria**:
  - "Join Call" button available when 1 other member is online
  - WebRTC P2P connection established using STUN servers
  - Both participants see each other's video and hear audio
  - Basic connection status indicator (connecting, connected, failed)

### 10.4. Share screen during call
- **ID**: POC-US-004
- **Description**: As a call participant, I want to share my screen so that others can see my desktop or applications
- **Acceptance criteria**:
  - "Share Screen" button triggers browser's getDisplayMedia() prompt
  - Screen content replaces or supplements video feed for other participant
  - Screen sharing can be started and stopped during call
  - Basic quality controls (resolution selection if supported by browser)

### 10.5. Use basic call controls
- **ID**: POC-US-005
- **Description**: As a call participant, I want basic controls so that I can manage my audio, video, and participation
- **Acceptance criteria**:
  - Mute/unmute audio button with visual feedback
  - Enable/disable video button with visual feedback
  - Leave call button that ends P2P connection
  - Connection quality indicator showing basic status

### 10.6. Handle connection failures gracefully
- **ID**: POC-US-006
- **Description**: As a user, I want clear feedback when connections fail so that I understand what's happening
- **Acceptance criteria**:
  - Clear error messages for P2P connection failures
  - Basic retry mechanism for failed connections
  - Fallback messaging when WebRTC is not supported
  - Simple troubleshooting hints for common issues

### 10.7. Maintain group state during session
- **ID**: POC-US-007
- **Description**: As a group member, I want to see who's online and available so that I know when I can start calls
- **Acceptance criteria**:
  - Real-time member list showing online/offline status
  - Visual indicators when members join or leave the group
  - Basic presence management (online when in group, offline when closed)
  - Group persists as long as at least one member is connected

### 10.8. Access POC via web browser
- **ID**: POC-US-008
- **Description**: As a user, I want to use the POC through my web browser so that I don't need to install additional software
- **Acceptance criteria**:
  - Works in Chrome, Firefox, Safari, and Edge (latest versions)
  - Responsive design works on desktop screens (no mobile optimization)
  - Clear browser compatibility warnings for unsupported browsers
  - Basic WebRTC feature detection and graceful degradation
