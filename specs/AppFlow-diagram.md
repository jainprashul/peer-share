# App Flow Diagram

This diagram illustrates the complete application flow based on the AppFlow.md specification.

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant P as PeerJS
    participant G as Group Members

    Note over C,G: Application Startup & Group Creation
    C->>S: Initialize WebSocket Connection
    S-->>C: Connection Established
    C->>S: Create Group Message
    S-->>C: Group Created
    C->>C: Navigate to Group Page
    Note over C: Show group details

    Note over C,G: User Joins Group
    C->>S: Join Group Message
    S-->>C: Group Joined
    S->>G: Broadcast User Joined to All Group Members

    Note over C,G: PeerJS Initialization
    C->>P: Initialize PeerJS with userId
    C->>S: Update Peer ID Message
    S->>G: Broadcast Update Peer ID to All Group Members

    Note over C,G: User Leaves Group
    C->>S: Leave Group Message
    S->>G: Broadcast User Left to All Group Members
    S->>C: Send existing peers to new user

    Note over C,G: Call Request Flow
    C->>S: Call Request Message
    S->>G: Incoming Call Request to Target Peer
    C->>S: Call Response Message
    S->>G: Broadcast Call Response to Original Caller

    Note over C,G: Call Execution
    C->>C: Navigate to Call Page
    C->>P: Start Call with Target Peer
    P->>P: PeerJS starts the call

    Note over C,G: Disconnection Handling
    S->>S: Handle WebSocket Disconnection
    S->>G: Perform leave group operations
```

<img src="./appflow.svg" alt="App Flow Diagram" />

## Flow Description

### 1. **Application Startup**
- Client initializes WebSocket connection
- Server confirms connection establishment
- Client creates a group and receives confirmation

### 2. **Group Management**
- Client joins the group
- Server broadcasts user joined event to all group members
- Client initializes PeerJS with a unique userId
- Server broadcasts peer ID updates to all group members

### 3. **Call Management**
- Client sends call request to server
- Server forwards call request to target peer
- Client responds to call request
- Server broadcasts call response to original caller

### 4. **Call Execution**
- Client navigates to call page
- Client initiates call using PeerJS
- Direct peer-to-peer communication begins

### 5. **Disconnection Handling**
- Server monitors WebSocket connections
- Automatically performs leave group operations on disconnection
- Maintains group state consistency

## Key Components

- **Client**: Frontend application handling UI and user interactions
- **Server**: WebSocket server managing group state and message routing
- **PeerJS**: WebRTC library for peer-to-peer communication
- **Group Members**: Other clients in the same group

## Message Types

1. **Connection Messages**: WebSocket initialization and confirmation
2. **Group Messages**: Create, join, leave group operations
3. **Peer Messages**: Peer ID updates and synchronization
4. **Call Messages**: Call requests, responses, and management
5. **Broadcast Messages**: Server-to-multiple-clients notifications
