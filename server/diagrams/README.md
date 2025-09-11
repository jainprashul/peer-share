# PeerShare WebSocket Flow Diagrams

This directory contains visual representations of the PeerShare WebSocket message flow system.

## Diagram Files

### 🔄 **01. Complete Message Processing Flow**
- **File**: `01-complete-flow.png` / `01-complete-flow.mmd`
- **Description**: End-to-end WebSocket message processing pipeline from connection to response
- **Shows**: Connection setup, JSON parsing, Zod validation, message routing, business logic, and broadcasting

### ⚡ **02. Validation Schemas**
- **File**: `02-validation-schemas.png` / `02-validation-schemas.mmd`
- **Description**: Zod validation schema architecture and discriminated union routing
- **Shows**: How messages are validated based on type and payload structure

### 🔗 **03. Connection Lifecycle**
- **File**: `03-connection-lifecycle.png` / `03-connection-lifecycle.mmd`
- **Description**: WebSocket connection states and transitions
- **Shows**: From initial connection to authenticated P2P-ready state

### 📡 **04. Broadcasting Patterns**
- **File**: `04-broadcasting-patterns.png` / `04-broadcasting-patterns.mmd`
- **Description**: Message delivery patterns (broadcast vs unicast)
- **Shows**: Which messages go to all group members vs specific recipients

### ⚠️ **05. Error Handling Flow**
- **File**: `05-error-handling.png` / `05-error-handling.mmd`
- **Description**: Comprehensive error handling and response system
- **Shows**: Different error types and their specific response patterns

## How to Use

### For Development
- Reference these diagrams when implementing new message types
- Understand the validation pipeline before adding new schemas
- See the complete request/response cycle for debugging

### For Documentation
- Include PNG files in presentations or documentation
- Use as visual aids when explaining the system architecture
- Reference during code reviews

### For Debugging
- Follow the flow diagrams to trace where issues might occur
- Check error handling patterns for proper error response implementation
- Verify broadcasting patterns for message delivery issues

## Regenerating Diagrams

To update the PNG files after modifying the .mmd files:

```bash
# Install Mermaid CLI (if not already installed)
npm install @mermaid-js/mermaid-cli --save-dev

# Convert individual diagrams
npx mmdc -i diagrams/01-complete-flow.mmd -o diagrams/01-complete-flow.png -w 1920 -H 1080 --backgroundColor white
npx mmdc -i diagrams/02-validation-schemas.mmd -o diagrams/02-validation-schemas.png -w 1600 -H 800 --backgroundColor white
npx mmdc -i diagrams/03-connection-lifecycle.mmd -o diagrams/03-connection-lifecycle.png -w 1200 -H 800 --backgroundColor white
npx mmdc -i diagrams/04-broadcasting-patterns.mmd -o diagrams/04-broadcasting-patterns.png -w 1400 -H 1000 --backgroundColor white
npx mmdc -i diagrams/05-error-handling.mmd -o diagrams/05-error-handling.png -w 1400 -H 900 --backgroundColor white
```

## Key Features Illustrated

1. **Runtime Type Safety**: All messages validated with Zod before processing
2. **Discriminated Union Routing**: Message type determines validation schema and handler
3. **Comprehensive Error Handling**: Different error types with detailed responses
4. **Selective Broadcasting**: Messages routed to appropriate recipients only
5. **Connection State Management**: Clear lifecycle from connection to P2P readiness
6. **Input Sanitization**: Automatic validation and cleaning of all inputs

## Integration Points

- **Frontend Developers**: Understand expected message formats and response patterns
- **Backend Developers**: See the complete processing pipeline and error handling
- **DevOps/Testing**: Trace message flows for debugging and testing scenarios
- **Documentation**: Visual aids for system architecture documentation
