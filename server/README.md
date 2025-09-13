# PeerShare POC Backend Server

A WebSocket-based signaling server for peer-to-peer video calling within groups, built for the PeerShare Phase 1 proof-of-concept.

## 🏗️ Architecture Overview

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   React Client  │ ◄───────────────► │   Node.js API   │
│   (Frontend)    │                   │   (Backend)     │
└─────────────────┘                   └─────────────────┘
                                              │
                                              │ In-Memory
                                              ▼
                                      ┌─────────────────┐
                                      │  GroupManager   │
                                      │   (Groups &     │
                                      │    Users)       │
                                      └─────────────────┘
```

## 🚀 Features

### Phase 1 Implementation
- ✅ **Group Management**: Create and join groups with unique IDs
- ✅ **WebSocket Communication**: Real-time bidirectional messaging with Zod validation
- ✅ **P2P Signaling**: WebRTC signaling support for PeerJS integration
- ✅ **User Management**: In-memory user and group storage
- ✅ **Connection Health**: Automatic ping/pong health monitoring
- ✅ **Error Handling**: Structured error responses with proper codes
- ✅ **CORS Support**: Configurable cross-origin resource sharing
- ✅ **TypeScript**: Full type safety and modern JavaScript features
- ✅ **Runtime Validation**: Zod schemas for all incoming data validation
- ✅ **Input Sanitization**: Automatic trimming and format validation

### Core Components
1. **GroupManager**: Handles group creation, joining, and member management with Zod validation
2. **WebSocketHandler**: Manages WebSocket connections and message routing with runtime type checking
3. **REST API**: HTTP endpoints for health checks and group validation with input validation
4. **Type System**: Comprehensive TypeScript interfaces and Zod schemas for all operations
5. **Validation Layer**: Runtime type safety using Zod for all incoming data

## 📁 Project Structure

```
server/
├── src/
│   ├── index.ts              # Main server entry point with environment validation
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── validation/
│   │   └── schemas.ts        # Zod validation schemas and type exports
│   ├── managers/
│   │   └── GroupManager.ts   # Group and user management with validation
│   ├── socket/
│   │   └── WebSocketHandler.ts # WebSocket connection handling with Zod validation
│   └── routes/
│       └── index.ts          # REST API routes with input validation
├── diagrams/                 # WebSocket flow diagrams (PNG + Mermaid source)
│   ├── 01-complete-flow.png  # Complete message processing pipeline
│   ├── 02-validation-schemas.png # Zod validation architecture
│   ├── 03-connection-lifecycle.png # WebSocket connection states
│   ├── 04-broadcasting-patterns.png # Message delivery patterns  
│   ├── 05-error-handling.png # Error response flows
│   └── README.md            # Diagram documentation
├── scripts/
│   └── generate-diagrams.js  # Regenerate PNG diagrams from Mermaid files
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── nodemon.json             # Development server config
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18.17+ 
- **npm** 9+
- Modern browser with WebRTC support

### Installation
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Start development server
npm run dev
```

### Build for Production
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:

```bash
# Server Configuration
PORT=3000                    # HTTP server port
WS_PORT=3001                # WebSocket server port  
NODE_ENV=development        # Environment mode

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000 # Health check interval (ms)
```

### Default Ports
- **HTTP Server**: `3000`
- **WebSocket Server**: `3001`
- **Client Dev Server**: `5173` (Vite default)

## 📡 API Reference

### REST Endpoints

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.567,
  "stats": {
    "totalGroups": 5,
    "totalUsers": 12,
    "averageGroupSize": 2.4
  }
}
```

#### Group Information
```http
GET /api/group/:groupId
```
**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Group",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "memberCount": 3,
  "exists": true
}
```

#### Group Validation
```http
HEAD /api/group/:groupId
```
- **200**: Group exists
- **404**: Group not found

#### Server Statistics
```http
GET /api/stats
```

### WebSocket Messages

All WebSocket messages are validated using Zod schemas and follow this structure:
```typescript
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
}
```

#### Message Processing Flow
1. **JSON Parsing**: Raw WebSocket data is parsed to JSON
2. **Zod Validation**: Message structure and payload are validated using discriminated unions
3. **Type Safety**: Validated messages are properly typed for handler functions
4. **Error Handling**: Validation errors return structured error responses with details
5. **Business Logic**: Validated data is processed by appropriate handlers

#### Validation Features
- **Schema-based Validation**: All incoming messages validated against Zod schemas
- **Type Discrimination**: Messages are validated based on their `type` field
- **Input Sanitization**: Automatic trimming and format validation for strings
- **Detailed Error Messages**: Validation errors include specific field-level details
- **Runtime Type Safety**: Prevents invalid data from reaching business logic

#### Client → Server Messages

**Create Group**
```json
{
  "type": "create-group",
  "payload": {
    "groupName": "My Group",
    "username": "John Doe"
  }
}
```

**Join Group**
```json
{
  "type": "join-group", 
  "payload": {
    "groupId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "Jane Smith",
    "peerId": "peer-123" // Optional
  }
}
```

**Update Peer ID**
```json
{
  "type": "update-peer-id",
  "payload": {
    "peerId": "peer-123"
  }
}
```

**Call Request**
```json
{
  "type": "call-request",
  "payload": {
    "targetPeerId": "peer-456", 
    "fromPeerId": "peer-123",
    "fromUsername": "John Doe"
  }
}
```

**Call Response**
```json
{
  "type": "call-response",
  "payload": {
    "accepted": true,
    "fromPeerId": "peer-456",
    "toPeerId": "peer-123"
  }
}
```

#### Server → Client Messages

**Group Created**
```json
{
  "type": "group-created",
  "payload": {
    "groupId": "550e8400-e29b-41d4-a716-446655440000",
    "groupName": "My Group",
    "user": {
      "id": "user-123",
      "username": "John Doe"
    }
  }
}
```

**Group Joined**
```json
{
  "type": "group-joined",
  "payload": {
    "groupId": "550e8400-e29b-41d4-a716-446655440000", 
    "groupName": "My Group",
    "user": {
      "id": "user-456", 
      "username": "Jane Smith"
    },
    "members": [
      {
        "id": "user-123",
        "username": "John Doe", 
        "peerId": "peer-123"
      }
    ]
  }
}
```

**User Joined**
```json
{
  "type": "user-joined",
  "payload": {
    "user": {
      "id": "user-456",
      "username": "Jane Smith",
      "peerId": "peer-456"
    }
  }
}
```

**Peer Discovery**
```json
{
  "type": "existing-peers",
  "payload": {
    "peers": [
      {
        "peerId": "peer-123",
        "username": "John Doe"
      }
    ]
  }
}
```

**Error Response**
```json
{
  "type": "error",
  "payload": {
    "code": "GROUP_NOT_FOUND",
    "message": "Group does not exist",
    "details": {}
  }
}
```

**Validation Error Response**
```json
{
  "type": "error",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "Invalid message format",
    "details": {
      "validationErrors": [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": ["payload", "groupName"],
          "message": "Required"
        }
      ]
    }
  }
}
```

## 🔍 Error Codes

| Code | Description |
|------|-------------|
| `INVALID_MESSAGE` | Malformed WebSocket message or validation failure |
| `GROUP_NOT_FOUND` | Requested group does not exist |
| `USERNAME_TAKEN` | Username already in use (auto-resolved) |
| `USER_NOT_FOUND` | User ID not found |
| `INVALID_GROUP_NAME` | Empty or invalid group name (caught by validation) |
| `INVALID_USERNAME` | Empty or invalid username (caught by validation) |
| `CONNECTION_ERROR` | WebSocket connection issue |
| `PEER_NOT_FOUND` | Target peer ID not found |
| `INVALID_GROUP_ID` | Invalid UUID format for group ID (API routes) |

## 🧪 Testing

### Manual Testing with wscat
```bash
# Install wscat globally
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3001

# Send test message
{"type": "create-group", "payload": {"groupName": "Test Group", "username": "TestUser"}}
```

### Browser Testing
1. Open browser developer console
2. Connect to WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => logger.log('Received:', JSON.parse(event.data));

// Valid message
ws.send(JSON.stringify({
  type: 'create-group', 
  payload: { groupName: 'Test Group', username: 'User1' }
}));

// Test validation error (invalid username)
ws.send(JSON.stringify({
  type: 'create-group', 
  payload: { groupName: 'Test Group', username: '' }
}));

// Test validation error (invalid message structure)
ws.send(JSON.stringify({
  type: 'invalid-type', 
  payload: {}
}));
```

### HTTP API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Group info (replace with actual group ID)
curl http://localhost:3000/api/group/550e8400-e29b-41d4-a716-446655440000
```

## 🚦 Development Workflow

### Available Scripts
```bash
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript to JavaScript  
npm start                # Start production server
npm run clean            # Remove build artifacts
npm run generate-diagrams # Generate PNG diagrams from Mermaid files
```

### Code Structure Guidelines
- **Types**: All interfaces in `src/types/index.ts`
- **Validation**: Zod schemas and type exports in `src/validation/schemas.ts`
- **Business Logic**: Core functionality in `src/managers/` with validation
- **Communication**: WebSocket handling in `src/socket/` with runtime validation
- **HTTP Routes**: REST endpoints in `src/routes/` with input validation
- **Error Handling**: Use structured error codes and detailed validation messages

## 📊 Visual Documentation

The server includes comprehensive visual documentation of the WebSocket message flow:

- **[Complete Flow Diagram](diagrams/01-complete-flow.png)**: End-to-end message processing pipeline
- **[Validation Architecture](diagrams/02-validation-schemas.png)**: Zod schema validation system
- **[Connection Lifecycle](diagrams/03-connection-lifecycle.png)**: WebSocket connection states and transitions
- **[Broadcasting Patterns](diagrams/04-broadcasting-patterns.png)**: Message delivery patterns (broadcast vs unicast)
- **[Error Handling](diagrams/05-error-handling.png)**: Comprehensive error response flows

See the [diagrams directory](diagrams/) for all visual documentation and source files.

## 🌐 Integration with Frontend

### WebSocket Connection (Client-side)
```typescript
// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3001');

// Handle connection open
ws.onopen = () => {
  logger.log('Connected to server');
};

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  logger.log('Received:', message);
  
  switch (message.type) {
    case 'group-created':
      // Handle group creation success
      break;
    case 'user-joined':
      // Handle new user joining
      break;
    case 'error':
      // Handle error response (including validation errors)
      if (message.payload.details?.validationErrors) {
        console.error('Validation errors:', message.payload.details.validationErrors);
      }
      break;
  }
};

// Send validated message
const sendMessage = (type: string, payload: any) => {
  // Client-side validation can use the same Zod schemas
  ws.send(JSON.stringify({ type, payload }));
};

// Example: Create group with proper validation
const createGroup = (groupName: string, username: string) => {
  // These will be validated server-side
  sendMessage('create-group', { groupName, username });
};
```

### PeerJS Integration Example
```typescript
// Initialize PeerJS with custom signaling
const peer = new Peer('user-id', {
  // Use your own signaling server instead of PeerJS cloud
  host: 'localhost',
  port: 9000, // Separate PeerJS server port
  path: '/peerjs',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  }
});

// Notify server about peer ID
peer.on('open', (peerId) => {
  sendMessage('update-peer-id', { peerId });
});
```

## 📊 Performance Considerations

### Phase 1 Limitations
- **In-Memory Storage**: Data lost on server restart
- **Single Instance**: No horizontal scaling support
- **No Persistence**: Groups and users are temporary
- **Basic Error Handling**: Limited error recovery
- **Development Focus**: Not production-optimized

### Scaling Notes for Future Phases
- Consider Redis for shared state management
- Implement database persistence
- Add clustering support with sticky sessions
- Optimize message broadcasting for large groups
- Add rate limiting and authentication

## 🔐 Security Considerations

### Current Implementation (Development Only)
- No authentication or authorization
- No input validation beyond basic checks  
- No rate limiting
- CORS configured for development origins
- WebSocket connections accept any client

### Production Requirements (Future Phases)
- JWT-based authentication
- Input sanitization and validation
- Rate limiting per connection
- HTTPS/WSS encryption
- Origin validation
- DDoS protection

## 🐛 Troubleshooting

### Common Issues

**WebSocket connection fails**
- Check if server is running on correct port (`3001`)
- Verify CORS configuration for your frontend origin
- Ensure firewall allows WebSocket connections

**Messages not reaching other clients**
- Verify both clients are in the same group
- Check WebSocket connection status in browser dev tools
- Review server console logs for error messages
- Ensure messages pass Zod validation (check for validation error responses)

**Type errors during development**
- Run `npm run build` to check TypeScript compilation
- Ensure all imports use correct file paths
- Verify interface definitions match Zod schema exports
- Check that validation schemas are properly imported

**Validation errors**
- Check message structure matches expected Zod schema
- Review validation error details in server console
- Ensure required fields are present and properly typed
- Verify string fields are not empty after trimming

**Server crashes on startup**
- Check if ports `3000` and `3001` are available
- Verify Node.js version (18.17+ required)
- Review error messages in console output

### Debug Mode
```bash
# Enable detailed logging
DEBUG=peershare:* npm run dev

# Or set log level
LOG_LEVEL=debug npm run dev
```

## 🛣️ Roadmap

### Completed (Phase 1)
- ✅ Basic group creation and joining with validation
- ✅ WebSocket-based real-time communication with Zod validation
- ✅ P2P signaling infrastructure with type safety
- ✅ In-memory state management with input sanitization
- ✅ Health monitoring and comprehensive error handling
- ✅ Runtime type safety and validation for all operations

### Planned (Phase 2+)
- 🔄 Database persistence (PostgreSQL/MongoDB)
- 🔄 Authentication and user accounts  
- 🔄 TURN server integration for NAT traversal
- 🔄 Group permissions and moderation
- 🔄 File sharing capabilities
- 🔄 Mobile app support
- 🔄 Recording and playback features

## 📝 Contributing

This is a proof-of-concept implementation. For production use:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is part of the PeerShare POC and is intended for evaluation purposes.

## 🤝 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server console logs for error details
- Test with minimal client implementation
- Verify WebSocket connection in browser developer tools

---

**PeerShare POC Backend v1.0.0** - Built with ❤️ for peer-to-peer collaboration
