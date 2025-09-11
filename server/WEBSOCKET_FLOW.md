# PeerShare WebSocket Message Flow

## Complete WebSocket Message Processing Flow

```mermaid
flowchart TD
    %% Connection Establishment
    A[Client Connects] -->|WebSocket| B[WebSocketHandler.handleConnection]
    B --> C[Setup Connection Properties]
    C --> D[ws.isAlive = true]
    C --> E[Setup ping/pong health check]
    C --> F[Setup message listener]
    
    %% Message Reception Flow
    F -->|Receives Buffer| G[Parse JSON from Buffer]
    G -->|Success| H[Call handleMessage with rawMessage]
    G -->|JSON Parse Error| I[Send INVALID_MESSAGE Error]
    I --> END1[Connection continues]
    
    %% Message Validation & Routing
    H --> J[validateMessage with Zod]
    J -->|Validation Success| K{Discriminated Union Routing}
    J -->|ZodError| L[Send Validation Error Response]
    L --> END2[Connection continues]
    
    %% Message Type Routing
    K -->|create-group| M[handleCreateGroup]
    K -->|join-group| N[handleJoinGroup]
    K -->|leave-group| O[handleLeaveGroup]
    K -->|call-request| P[handleCallRequest]
    K -->|call-response| Q[handleCallResponse]
    K -->|update-peer-id| R[handleUpdatePeerId]
    K -->|unknown type| S[Send INVALID_MESSAGE Error]
    S --> END3[Connection continues]
    
    %% Create Group Flow
    M --> M1[Extract groupName, username]
    M1 --> M2[groupManager.createGroup with Zod validation]
    M2 -->|Success| M3[Update WebSocket user properties]
    M3 --> M4[Send group-created response]
    M4 --> END4[Flow Complete]
    M2 -->|Error| M5[Send error response]
    M5 --> END5[Flow Complete]
    
    %% Join Group Flow
    N --> N1[Extract groupId, username, peerId]
    N1 --> N2[groupManager.joinGroup with validation]
    N2 -->|Success| N3[Update WebSocket user properties]
    N3 --> N4[Get existing group members]
    N4 --> N5[Send group-joined response to joiner]
    N5 --> N6[Broadcast user-joined to other members]
    N6 --> N7{Has peerId?}
    N7 -->|Yes| N8[Handle Peer Discovery]
    N7 -->|No| END6[Flow Complete]
    N8 --> N9[Broadcast peer-joined to others]
    N9 --> N10[Send existing-peers to new user]
    N10 --> END7[Flow Complete]
    N2 -->|Error| N11[Send error response]
    N11 --> END8[Flow Complete]
    
    %% Leave Group Flow
    O --> O1[Extract userId from payload]
    O1 --> O2{userId matches ws.userId?}
    O2 -->|No| O3[Send USER_NOT_FOUND error]
    O3 --> END9[Flow Complete]
    O2 -->|Yes| O4[performLeaveGroup]
    O4 --> O5[groupManager.cleanupUser]
    O5 --> O6[Broadcast user-left to group members]
    O6 --> O7[Clear WebSocket user properties]
    O7 --> END10[Flow Complete]
    
    %% Call Request Flow
    P --> P1[Extract targetPeerId, fromPeerId, fromUsername]
    P1 --> P2[groupManager.getUserByPeerId]
    P2 -->|User Found| P3[Forward incoming-call-request to target]
    P2 -->|User Not Found| P4[Send PEER_NOT_FOUND error]
    P3 --> END11[Flow Complete]
    P4 --> END12[Flow Complete]
    
    %% Call Response Flow
    Q --> Q1[Extract accepted, fromPeerId, toPeerId]
    Q1 --> Q2[groupManager.getUserByPeerId for caller]
    Q2 -->|User Found| Q3[Forward call-response to original caller]
    Q2 -->|User Not Found| Q4[Send PEER_NOT_FOUND error]
    Q3 --> END13[Flow Complete]
    Q4 --> END14[Flow Complete]
    
    %% Update Peer ID Flow
    R --> R1[Extract peerId from payload]
    R1 --> R2{ws.userId exists?}
    R2 -->|No| R3[Send USER_NOT_FOUND error]
    R3 --> END15[Flow Complete]
    R2 -->|Yes| R4[groupManager.updateUserPeerId]
    R4 --> R5{Update successful and in group?}
    R5 -->|Yes| R6[handlePeerDiscovery]
    R5 -->|No| END16[Flow Complete]
    R6 --> END17[Flow Complete]
    
    %% Error Handling
    classDef errorClass fill:#ffeeee,stroke:#ff0000,stroke-width:2px
    classDef successClass fill:#eeffee,stroke:#00aa00,stroke-width:2px
    classDef processClass fill:#eeeeff,stroke:#0000aa,stroke-width:2px
    classDef validationClass fill:#fff0ee,stroke:#ff8800,stroke-width:2px
    
    class I,L,M5,N11,O3,P4,Q4,R3,S errorClass
    class M4,N5,N6,N9,N10,O6,P3,Q3 successClass
    class B,H,J,K,M2,N2,O4,O5,P2,Q2,R4 processClass
    class J,M2,N2 validationClass
```

## Message Type Validation Schemas

```mermaid
graph LR
    A[Raw WebSocket Message] --> B[JSON.parse]
    B --> C[Zod validateMessage]
    C --> D{Discriminated Union}
    
    D -->|type: 'create-group'| E[CreateGroupMessageSchema]
    D -->|type: 'join-group'| F[JoinGroupMessageSchema]
    D -->|type: 'leave-group'| G[LeaveGroupMessageSchema]
    D -->|type: 'call-request'| H[CallRequestMessageSchema]
    D -->|type: 'call-response'| I[CallResponseMessageSchema]
    D -->|type: 'update-peer-id'| J[UpdatePeerIdMessageSchema]
    
    E --> E1[Validate groupName: GroupNameSchema<br/>Validate username: UsernameSchema]
    F --> F1[Validate groupId: GroupIdSchema<br/>Validate username: UsernameSchema<br/>Validate peerId: PeerIdSchema optional]
    G --> G1[Validate userId: UserIdSchema]
    H --> H1[Validate targetPeerId: PeerIdSchema<br/>Validate fromPeerId: PeerIdSchema<br/>Validate fromUsername: UsernameSchema]
    I --> I1[Validate accepted: boolean<br/>Validate fromPeerId: PeerIdSchema<br/>Validate toPeerId: PeerIdSchema]
    J --> J1[Validate peerId: PeerIdSchema]
    
    classDef schemaClass fill:#fff5ee,stroke:#ff8800,stroke-width:2px
    class E,F,G,H,I,J,E1,F1,G1,H1,I1,J1 schemaClass
```

## WebSocket Connection Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Connected: Client connects
    Connected --> Authenticated: Successful group join/create
    Authenticated --> InGroup: User joins group
    InGroup --> HasPeerId: User provides peer ID
    HasPeerId --> CanCall: Ready for P2P calls
    
    Connected --> Disconnected: Connection error
    Authenticated --> Disconnected: Leave group / error
    InGroup --> Disconnected: Leave group / error  
    HasPeerId --> Disconnected: Leave group / error
    CanCall --> Disconnected: Leave group / error
    
    Disconnected --> [*]
    
    note right of Authenticated
        WebSocket properties set:
        - ws.userId
        - ws.username
        - ws.groupId
    end note
    
    note right of HasPeerId
        User can be discovered
        by other peers for
        WebRTC connections
    end note
```

## Message Broadcasting Patterns

```mermaid
graph TD
    A[WebSocket Handler] --> B{Message Type}
    
    B -->|user-joined| C[Broadcast to Group Members<br/>excluding sender]
    B -->|user-left| D[Broadcast to Group Members<br/>excluding leaver]
    B -->|peer-joined| E[Broadcast to Group Members<br/>excluding new peer]
    B -->|group-created| F[Send to Creator Only]
    B -->|group-joined| G[Send to Joiner Only]
    B -->|incoming-call-request| H[Send to Target Peer Only]
    B -->|call-response| I[Send to Original Caller Only]
    B -->|existing-peers| J[Send to New Peer Only]
    B -->|error| K[Send to Sender Only]
    
    C --> C1[All group members see new user]
    D --> D1[All group members notified of departure]
    E --> E1[All peers notified for WebRTC discovery]
    F --> F1[Creator gets group details]
    G --> G1[Joiner gets group + member list]
    H --> H1[Target peer gets call request]
    I --> I1[Caller gets accept/reject response]
    J --> J1[New peer gets existing peer list]
    K --> K1[Sender gets error details]
    
    classDef broadcastClass fill:#e6f3ff,stroke:#0066cc,stroke-width:2px
    classDef unicastClass fill:#ffe6f3,stroke:#cc0066,stroke-width:2px
    
    class C,D,E,C1,D1,E1 broadcastClass
    class F,G,H,I,J,K,F1,G1,H1,I1,J1,K1 unicastClass
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}
    
    B -->|JSON Parse Error| C[Send INVALID_MESSAGE<br/>Invalid JSON format]
    B -->|Zod Validation Error| D[Send INVALID_MESSAGE<br/>with validationErrors details]
    B -->|Group Not Found| E[Send GROUP_NOT_FOUND]
    B -->|User Not Found| F[Send USER_NOT_FOUND]
    B -->|Peer Not Found| G[Send PEER_NOT_FOUND]
    B -->|Connection Error| H[Send CONNECTION_ERROR]
    B -->|Username/Group Name Invalid| I[Caught by Zod validation]
    
    C --> C1[Log error + continue connection]
    D --> D1[Log validation details + continue]
    E --> E1[Log + continue connection]
    F --> F1[Log + continue connection]
    G --> G1[Log + continue connection]
    H --> H1[Log + continue connection]
    I --> D
    
    D1 --> J[Client receives detailed field errors]
    C1 --> K[Client receives generic format error]
    E1 --> L[Client receives group not found error]
    F1 --> M[Client receives user not found error]
    G1 --> N[Client receives peer not found error]
    H1 --> O[Client receives connection error]
    
    classDef errorClass fill:#ffeeee,stroke:#aa0000,stroke-width:2px
    classDef responseClass fill:#fff5ee,stroke:#cc6600,stroke-width:2px
    
    class C,D,E,F,G,H errorClass
    class J,K,L,M,N,O responseClass
```

## Key Features Demonstrated

1. **Runtime Type Safety**: All messages validated with Zod before processing
2. **Discriminated Union Routing**: Message type determines validation schema and handler
3. **Input Sanitization**: Automatic trimming and format validation
4. **Comprehensive Error Handling**: Different error types with detailed responses
5. **Broadcasting Patterns**: Selective message delivery based on context
6. **Connection Lifecycle**: State management from connection to disconnection
7. **Peer Discovery**: WebRTC peer management for P2P connections

## Message Examples

### Valid Create Group Message
```json
{
  "type": "create-group",
  "payload": {
    "groupName": "My Team Meeting",
    "username": "john_doe"
  }
}
```

### Validation Error Response
```json
{
  "type": "error",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "Invalid message format",
    "details": {
      "validationErrors": [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "Username cannot be empty",
          "path": ["payload", "username"]
        }
      ]
    }
  },
  "timestamp": 1642781234567
}
```
