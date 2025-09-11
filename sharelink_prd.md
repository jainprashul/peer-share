# PRD: PeerShare - Real-time P2P Screen Sharing and Video Calling Platform

## 1. Product overview

### 1.1 Document title and version
- PRD: PeerShare - Real-time P2P Screen Sharing and Video Calling Platform
- Version: 2.1 (Chat & Group-Based)

### 1.2 Product summary
PeerShare is a modern, low-latency screen sharing and video calling application built around persistent groups and channels, intelligently using peer-to-peer connections for 1:1 calls and SFU (Selective Forwarding Unit) architecture for group calls. Built with WebRTC at its core, the platform provides Discord-like functionality with robust NAT traversal, high-quality screen sharing using `getDisplayMedia()`, and enterprise-grade reliability.

The application targets small teams, remote developers, and online tutors who need reliable, low-latency real-time collaboration within organized groups and channels. By leveraging P2P for direct connections and falling back to SFU for scalability, PeerShare optimizes for both performance and cost-effectiveness while maintaining consistent user experience across web and native platforms. Users create or join persistent groups, participate in text channels, and initiate voice/video calls directly from their group context.

## 2. Goals

### 2.1 Business goals
- Achieve <200ms median latency for P2P calls in same region
- Reach 80% call success rate without TURN relay on typical consumer networks
- Build scalable SFU infrastructure supporting thousands of concurrent users
- Target specific niches: developer teams, distributed organizations, online learning groups
- Create sustainable revenue through group size limits, premium features, and advanced analytics

### 2.2 User goals
- Join organized groups with persistent communication channels
- Establish video calls with <30 seconds setup time from within group context
- Share screens with ≥15fps frame rate for smooth collaboration
- Participate in group calls up to 20 participants with acceptable quality
- Access reliable connection even behind restrictive NATs
- Record and download sessions for future reference within group archives

### 2.3 Non-goals
- Competing with enterprise video conferencing (Zoom, Teams) on feature breadth
- Supporting legacy browsers (IE, old Safari versions)
- Advanced persistent chat features (focus on real-time communication)
- Advanced video effects or filters in MVP
- Self-hosted on-premise solutions in initial release

## 3. User personas

### 3.1 Key user types
- Remote development teams with ongoing projects
- Small distributed organizations (5-50 members)
- Online learning groups and study circles
- Technical support teams with client groups
- Design teams with client collaboration needs

### 3.2 Basic persona details
- **Development Teams**: Software engineering teams who need organized channels for different projects with integrated screen sharing for code reviews and pair programming
- **Distributed Organizations**: Small companies or departments requiring structured communication with quick access to video calls and screen sharing
- **Learning Groups**: Educational cohorts, study groups, and online courses needing organized discussion channels with tutoring capabilities
- **Support Teams**: Technical professionals managing multiple client groups with dedicated channels and screen sharing for troubleshooting
- **Creative Teams**: Design and creative teams collaborating with clients through dedicated group spaces for reviews and feedback sessions

### 3.3 Role-based access
- **Guests**: Join specific groups via invite links with limited channel access and 60-minute call limits
- **Group Members**: Full access to group channels, unlimited call duration, access to group history and recordings
- **Group Moderators**: Advanced controls including member management, channel creation, recording management, and call permissions
- **Group Owners**: Full administrative control including group settings, billing management, and member role assignments
- **Premium Users**: Priority TURN server access, longer recording storage, and advanced group analytics

## 4. Functional requirements

- **Group & Channel Management** (Priority: High)
  - Persistent group creation with unique identifiers and invite systems
  - Multiple text channels per group for organized conversations
  - Voice/video channel creation with permanent links
  - Member invitation and role-based permission system

- **WebRTC P2P Connections** (Priority: High)
  - Direct peer-to-peer video, audio, and screen sharing for 1:1 calls within groups
  - STUN server integration for NAT discovery and candidate gathering
  - Automatic TURN fallback when P2P fails
  - ICE connectivity checks and connection quality monitoring

- **SFU Group Calls** (Priority: High)
  - Selective Forwarding Unit for 3+ participant calls in voice channels
  - Publish/subscribe model with simulcast support
  - Adaptive bitrate based on network conditions
  - CPU-efficient media routing with regional SFU deployment

- **Screen Sharing** (Priority: High)
  - Browser-based `getDisplayMedia()` for application/desktop sharing
  - Separate screen stream handling alongside camera feeds
  - Full desktop, specific application, and browser tab capture options
  - Screen share quality optimization (frame rate, resolution adaptation)

- **Group Communication** (Priority: High)
  - Basic text messaging within channels for context and coordination
  - Call initiation directly from text channels with member notifications
  - JWT-based authentication with OAuth integration
  - WebSocket signaling for offer/answer exchange and ICE candidates
  - Member presence indicators and status management

- **Recording & Storage** (Priority: Medium)
  - Server-side recording via SFU output with ffmpeg transcoding
  - S3-compatible storage for recorded sessions organized by group
  - Configurable retention policies and group-controlled deletion
  - Download links with expiration and group member access controls

- **Cross-platform Support** (Priority: Medium)
  - React web application with TypeScript
  - Electron desktop wrapper for enhanced native integration
  - React Native mobile apps with react-native-webrtc
  - Responsive UI design for various screen sizes

- **Network Resilience** (Priority: Medium)
  - Coturn TURN server deployment with TLS and authentication
  - Regional TURN server selection for optimal routing
  - Connection quality indicators and automatic adaptation
  - Graceful reconnection handling for temporary network issues

## 5. User experience

### 5.1 Entry points & first-time user flow
- Direct web access with group browsing or creation (signup required for group creation)
- OAuth sign-in flow (Google, GitHub, Discord) for seamless onboarding
- Group invite link sharing via email, messaging, or direct URL copying
- Mobile app downloads with group discovery and joining capabilities
- Developer-friendly API documentation for group integrations

### 5.2 Core experience
- **Group Creation/Joining**: Users create new groups or join existing ones via invite links, immediately seeing organized channel structure
  - The interface shows group member list and provides channel navigation with clear purpose descriptions
- **Channel Navigation**: Members browse text and voice channels, seeing active participants and ongoing conversations
  - Channel-specific permissions and purposes are clearly displayed with easy switching between channels
- **Call Initiation**: Users join voice channels or start calls directly from text channels with one-click access
  - Browser compatibility checks and permission requests are handled smoothly with clear explanations
- **Active Calls**: Clean participant grid within channel context with prominent screen share area and overlay controls
  - Group members can see who's in calls and join/leave seamlessly with channel-based notifications
- **Screen Sharing**: Single-click screen share with source selection dialog and immediate preview for the sharer
  - Recipients see high-quality screen content with minimal latency and smooth frame rates
- **Group Dynamics**: Automatic transition from P2P to SFU when third participant joins, with visual indicators
  - Group moderator controls become available with member management and recording options

### 5.3 Advanced features & edge cases
- Automatic codec negotiation (VP8/VP9 with H.264 fallback)
- Bandwidth adaptation with quality degradation warnings
- Mobile-specific optimizations for battery life and data usage
- Keyboard shortcuts for power users (mute, camera toggle, screen share, channel switching)
- Accessibility support including screen reader compatibility
- Group member search and filtering capabilities

### 5.4 UI/UX highlights
- Discord-inspired sidebar with group and channel organization
- Real-time network diagnostics with actionable troubleshooting steps
- Animated connection state indicators (connecting, connected, reconnecting)
- Contextual help system with embedded WebRTC troubleshooting
- Dark/light theme with system preference detection
- Member presence indicators and status customization

## 6. Narrative

Alex is a remote software developer working in a distributed team of 8 engineers. His team uses PeerShare to organize their communication around different projects, each with dedicated channels for planning, code reviews, and general discussion. When Alex needs to pair program on a complex feature, he joins the "Backend Development" voice channel where his teammate Sarah is already present, and they automatically establish a P2P connection for low-latency screen sharing. As they work through the code, other team members can see they're collaborating and choose to join for input or simply monitor progress. When their team lead drops in for a quick architecture review, PeerShare seamlessly transitions to SFU mode, and the session recording captures important decisions for the entire team's future reference. The organized group structure ensures all communication and collaboration happens in context, making it easy for team members to stay informed and contribute when needed.

## 7. Success metrics

### 7.1 User-centric metrics
- Time to first successful call within group: target <30 seconds from channel join
- Call connection success rate: >95% overall, >80% without TURN relay
- Screen sharing frame rate: maintain ≥15fps for typical desktop sharing
- Group member retention: 30-day active member rate and engagement frequency
- Feature adoption: P2P vs SFU usage patterns and screen sharing engagement within groups

### 7.2 Business metrics
- Daily/Monthly Active Groups and group growth rate
- Average group size and member engagement patterns
- Conversion rate from guest to group member to premium features
- Group retention rates and churn analysis
- Revenue per group and lifetime value metrics

### 7.3 Technical metrics
- Median end-to-end latency: <200ms target for same-region P2P calls
- TURN relay usage percentage (cost optimization metric)
- SFU CPU utilization per concurrent group session
- Connection establishment latency and failure rates
- Bandwidth utilization per participant across different quality settings

## 8. Technical considerations

### 8.1 Integration points
- WebRTC browser APIs: getUserMedia, getDisplayMedia, RTCPeerConnection
- Signaling server: Node.js + Socket.IO for WebSocket communication
- SFU integration: mediasoup for media routing and transcoding
- TURN infrastructure: coturn with regional deployment and load balancing
- Cloud services: AWS S3 for recordings, PostgreSQL + Redis for group/channel state management

### 8.2 Data storage & privacy
- In-transit encryption via DTLS-SRTP (WebRTC standard)
- JWT-based authentication with short-lived access tokens
- Group-based data isolation and access controls
- GDPR compliance with user data deletion and consent management
- Optional E2EE roadmap using WebRTC insertable streams

### 8.3 Scalability & performance
- Horizontal scaling of SFU nodes with Kubernetes orchestration
- Regional deployment for latency optimization
- TURN server autoscaling based on relay demand
- Database connection pooling and Redis clustering for group state management
- CDN distribution for static assets and application delivery

### 8.4 Potential challenges
- WebRTC browser compatibility differences (Safari H.264 limitations)
- NAT traversal in enterprise/restricted networks requiring TURN servers
- SFU resource costs scaling with group size and simultaneous calls
- Mobile device performance constraints during intensive screen sharing
- Group management complexity and permission system scalability

## 9. Milestones & sequencing

### 9.1 Project estimate
- Large: 5-7 months for production-ready MVP with all core features

### 9.2 Team size & composition
- Engineering Team: 7-9 total people
  - 1 Product manager for requirements and user research
  - 4-5 Full-stack engineers (Node.js, React, WebRTC expertise)
  - 1 DevOps engineer (Kubernetes, infrastructure as code)
  - 1 Frontend specialist (React, TypeScript, responsive design)
  - 1 QA engineer (automated testing, WebRTC load testing)

### 9.3 Suggested phases
- **Phase 0**: Planning & Infrastructure Setup (2 weeks)
  - Key deliverables: Tech spikes (mediasoup evaluation), basic K8s cluster, coturn deployment, CI/CD pipeline
- **Phase 1**: Core MVP - Groups & P2P Foundation (8 weeks)
  - Key deliverables: Group/channel management, WebRTC P2P connections, screen sharing, basic signaling server, TURN fallback, authentication
- **Phase 2**: SFU & Advanced Group Features (5 weeks)
  - Key deliverables: mediasoup integration, publish/subscribe model, member management, advanced UI improvements
- **Phase 3**: Recording & Production Readiness (4 weeks)
  - Key deliverables: Server-side recording, S3 storage, monitoring stack, load testing, security hardening

## 10. User stories

### 10.1. Create and manage groups
- **ID**: US-001
- **Description**: As a user, I want to create persistent groups with organized channels so that my team can have structured communication and collaboration spaces
- **Acceptance criteria**:
  - Group creation generates unique ID and customizable invite links within 5 seconds
  - Support for multiple text and voice channels per group
  - Role-based permissions for group owners, moderators, and members
  - Group settings include name, description, privacy controls, and member limits

### 10.2. Join groups via invite links
- **ID**: US-002
- **Description**: As a user, I want to join groups through invite links so that I can participate in existing team communications and calls
- **Acceptance criteria**:
  - Invite links work for both authenticated and guest users
  - Clear onboarding flow showing group purpose and available channels
  - Automatic role assignment based on invite link type
  - Group member welcome notifications and channel introductions

### 10.3. Navigate and participate in channels
- **ID**: US-003
- **Description**: As a group member, I want to browse different channels and see who's active so that I can join relevant conversations and calls
- **Acceptance criteria**:
  - Sidebar navigation showing all accessible channels with activity indicators
  - Member presence indicators showing online status and current channel
  - Quick channel switching with keyboard shortcuts
  - Channel-specific member lists and permissions

### 10.4. Initiate calls from within group context
- **ID**: US-004
- **Description**: As a group member, I want to start voice/video calls directly from channels so that collaboration feels natural within our group workflow
- **Acceptance criteria**:
  - One-click call initiation from text channels with member notifications
  - Direct join to voice channels with automatic P2P connection establishment
  - Visual indicators showing active calls and participants across channels
  - Call history and context preserved within group structure

### 10.5. Share screen in group calls
- **ID**: US-005
- **Description**: As a presenter, I want to share my screen during group calls so that team members can see my desktop content in real-time
- **Acceptance criteria**:
  - Browser prompts for screen capture permission with clear source selection
  - Support for full desktop, application window, and browser tab sharing
  - Screen content displays with ≥15fps frame rate for typical desktop scenarios
  - Screen sharing can be started/stopped without affecting audio/video call

### 10.6. Transition from P2P to SFU for group calls
- **ID**: US-006
- **Description**: As a group member, I want the system to automatically handle the transition from P2P to SFU when additional participants join so that group calls work seamlessly
- **Acceptance criteria**:
  - System detects when third participant attempts to join the call
  - Automatic migration from P2P to SFU architecture without call interruption
  - All existing streams (audio, video, screen) maintained during transition
  - Visual indicators inform users about the connection type change

### 10.7. Authenticate with OAuth providers
- **ID**: US-007
- **Description**: As a user, I want to sign in using my Google, GitHub, or Discord account so that I can access persistent group features without creating new credentials
- **Acceptance criteria**:
  - OAuth flow supports Google, GitHub, and Discord with secure token exchange
  - JWT access tokens generated with appropriate expiration (1 hour)
  - User profile information stored for group membership and history
  - Guest access remains available for temporary group participation

### 10.8. Record group sessions
- **ID**: US-008
- **Description**: As a group moderator, I want to record group calls so that absent team members can review the content later
- **Acceptance criteria**:
  - Recording can be initiated by group moderator with participant consent prompts
  - SFU captures all active streams (audio, video, screen shares) into single recording
  - ffmpeg transcoding produces standard MP4 output with configurable quality
  - Recordings stored in group archives with secure access controls for members

### 10.9. Manage group members and permissions
- **ID**: US-009
- **Description**: As a group owner or moderator, I want to control member access and permissions so that I can maintain group organization and security
- **Acceptance criteria**:
  - Ability to invite, remove, and change member roles within the group
  - Channel-specific permissions for viewing, joining calls, and screen sharing
  - Member activity monitoring and moderation tools
  - Bulk member management for larger groups

### 10.10. Handle network quality degradation gracefully
- **ID**: US-010
- **Description**: As a participant, I want the system to adapt to network conditions so that group calls remain usable during bandwidth constraints
- **Acceptance criteria**:
  - Real-time bandwidth detection triggers quality adjustments (resolution, frame rate)
  - Visual indicators show connection quality status (good, fair, poor)
  - Automatic codec switching (VP9 to VP8) when necessary
  - Graceful reconnection attempts with exponential backoff during network interruptions

### 10.11. Access group history and analytics
- **ID**: US-011
- **Description**: As a group member, I want to view group activity history with basic analytics so that I can track participation patterns and access past recordings
- **Acceptance criteria**:
  - Dashboard displays recent group activity with timestamps, duration, and participant count
  - Connection quality statistics (P2P vs TURN usage, average latency)
  - Access to group recordings with search and filtering capabilities
  - Export group data in JSON format for external analysis

### 10.12. Use mobile applications for group participation
- **ID**: US-012
- **Description**: As a mobile user, I want to join group calls from my smartphone or tablet so that I can participate in team communications while away from my computer
- **Acceptance criteria**:
  - React Native apps provide core functionality (join groups, channels, audio/video, basic controls)
  - Mobile screen sharing capability for demonstrating mobile apps or content
  - Battery optimization prevents excessive drain during extended group calls
  - Touch-optimized interface with gesture controls for common actions

### 10.13. Deploy and monitor SFU infrastructure
- **ID**: US-013
- **Description**: As a DevOps engineer, I want automated deployment and monitoring of SFU nodes so that the system scales reliably under group load
- **Acceptance criteria**:
  - Kubernetes deployment with horizontal pod autoscaling based on CPU/memory metrics
  - Prometheus metrics collection for SFU performance (connections, CPU, bandwidth)
  - Regional deployment with automatic routing to nearest SFU instance
  - Health checks and automatic replacement of failed SFU nodes

### 10.14. Implement WebSocket signaling protocol for groups
- **ID**: US-014
- **Description**: As a developer, I want a robust signaling protocol so that WebRTC offer/answer exchange and ICE candidate sharing work reliably within group contexts
- **Acceptance criteria**:
  - Socket.IO server handles group joining, channel switching, offer/answer, and ICE candidate messages
  - Message validation and rate limiting prevents abuse and malformed requests
  - Group and channel state tracking with automatic cleanup of abandoned sessions
  - Comprehensive error handling with meaningful client-side error messages

### 10.15. Optimize TURN server usage and costs
- **ID**: US-015
- **Description**: As a system administrator, I want efficient TURN server deployment so that relay costs remain manageable while maintaining connection reliability across groups
- **Acceptance criteria**:
  - Regional coturn servers with TLS and token-based authentication
  - Usage analytics tracking percentage of calls requiring TURN relay
  - Automatic scaling based on relay demand with cost monitoring
  - Load balancing across multiple TURN servers for reliability and capacity
