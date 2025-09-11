# PeerShare POC - Tech Stack Specification

## Overview
This document outlines the complete technology stack for the PeerShare POC, with TypeScript as the primary language across frontend, backend, and shared utilities.

## Core Language & Runtime

### TypeScript
- **Version**: 5.2+
- **Target**: ES2022
- **Module**: ESNext
- **Rationale**: Type safety, better developer experience, easier refactoring, excellent WebRTC API typing

### Node.js
- **Version**: 18.17+ LTS
- **Rationale**: Stable LTS with excellent TypeScript support, native WebSocket capabilities, strong ecosystem

## Frontend Stack

### Core Framework
- **React**: 18.2+
  - Functional components with hooks
  - TypeScript strict mode
  - Context API for state management
- **Vite**: 4.4+ (Build tool)
  - Fast development server
  - TypeScript support out of the box
  - Hot module replacement
  - Optimized production builds

### WebRTC & Media
- **Native WebRTC APIs**:
  - `RTCPeerConnection`
  - `getUserMedia()`
  - `getDisplayMedia()`
  - TypeScript definitions via `@types/webrtc`
- **Simple-peer**: 9.11+
  - TypeScript-friendly WebRTC wrapper
  - Simplifies P2P connection management
  - Built-in signaling abstraction

### Real-time Communication
- **Socket.IO Client**: 4.7+
  - `socket.io-client` with TypeScript support
  - Type-safe event definitions
  - Automatic reconnection handling

### Styling & UI
- **Tailwind CSS**: 3.3+
  - Utility-first CSS framework
  - Excellent TypeScript integration
  - Responsive design utilities
- **Headless UI**: 1.7+ (Optional)
  - Accessible UI components for React
  - Full TypeScript support

### State Management
- **React Context + useReducer**
  - Built-in React state management
  - TypeScript-safe actions and state
  - No external dependencies

### Type Definitions
```typescript
// Frontend Types
interface User {
  id: string;
  username: string;
  isOnline: boolean;
}

interface Group {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
}

interface CallState {
  isInCall: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isScreenSharing: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}
```

## Backend Stack

### Core Framework
- **Express.js**: 4.18+
  - `@types/express` for TypeScript support
  - Lightweight and flexible
  - Easy WebSocket integration

### Real-time Communication
- **Socket.IO**: 4.7+
  - Full TypeScript support
  - Room management for groups
  - Event-based architecture
  - Built-in error handling

### Development Tools
- **ts-node**: 10.9+
  - Direct TypeScript execution
  - No compilation step in development
- **nodemon**: 3.0+
  - Auto-restart on file changes
  - TypeScript file watching

### Type Definitions
```typescript
// Backend Types
interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  callOffer: (offer: RTCSessionDescriptionInit, fromUserId: string) => void;
  callAnswer: (answer: RTCSessionDescriptionInit, fromUserId: string) => void;
  iceCandidate: (candidate: RTCIceCandidateInit, fromUserId: string) => void;
  callEnded: (userId: string) => void;
}

interface ClientToServerEvents {
  joinGroup: (groupId: string, username: string) => void;
  leaveGroup: () => void;
  sendCallOffer: (offer: RTCSessionDescriptionInit, toUserId: string) => void;
  sendCallAnswer: (answer: RTCSessionDescriptionInit, toUserId: string) => void;
  sendIceCandidate: (candidate: RTCIceCandidateInit, toUserId: string) => void;
  endCall: () => void;
}
```

## Shared Types & Utilities

### Shared Package Structure
```
/shared
  /types
    - user.types.ts
    - group.types.ts
    - call.types.ts
    - socket.types.ts
  /utils
    - validation.ts
    - constants.ts
  - index.ts
```

### Validation
- **Zod**: 3.22+
  - Runtime type validation
  - TypeScript-first schema declaration
  - Frontend and backend validation sharing

```typescript
import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(50),
  username: z.string().min(1).max(30)
});

export const JoinGroupSchema = z.object({
  groupId: z.string().uuid(),
  username: z.string().min(1).max(30)
});
```

## Development Tools

### Code Quality
- **ESLint**: 8.48+
  - `@typescript-eslint/parser`
  - `@typescript-eslint/eslint-plugin`
  - React-specific rules
- **Prettier**: 3.0+
  - Code formatting
  - TypeScript support
  - Integration with ESLint

### Testing (Optional for POC)
- **Vitest**: 0.34+
  - Fast TypeScript test runner
  - Jest-compatible API
  - Built-in TypeScript support
- **@testing-library/react**: 13.4+
  - React component testing
  - TypeScript support

### Development Environment
- **Concurrently**: 8.2+
  - Run frontend and backend simultaneously
  - Cross-platform script execution

## Infrastructure & Deployment

### STUN Servers
- **Google STUN**: `stun:stun.l.google.com:19302`
- **Mozilla STUN**: `stun:stun.services.mozilla.com`
- **Backup STUN**: `stun:stun1.l.google.com:19302`

### Environment Management
- **dotenv**: 16.3+
  - Environment variable management
  - TypeScript-safe environment config

```typescript
// Environment Types
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CORS_ORIGIN: string;
  STUN_SERVERS: string[];
}
```

### Process Management
- **PM2**: 5.3+ (Production)
  - Process management
  - TypeScript application support
  - Monitoring and logging

## Package.json Scripts

### Root Package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "build": "npm run client:build && npm run server:build",
    "start": "npm run server:start",
    "type-check": "npm run client:type-check && npm run server:type-check",
    "lint": "npm run client:lint && npm run server:lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### Client Package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Server Package.json
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Project Structure

```
peershare-poc/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── shared/                 # Shared types/utils
│   ├── types/
│   ├── utils/
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Root package.json
└── README.md
```

## TypeScript Configuration

### Root tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Client tsconfig.json
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../shared" }]
}
```

### Server tsconfig.json
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../shared" }]
}
```

## Key Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.2",
    "simple-peer": "^9.11.1",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.22",
    "@types/react-dom": "^18.2.7",
    "@types/simple-peer": "^9.11.5",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "@vitejs/plugin-react": "^4.0.4",
    "autoprefixer": "^10.4.15",
    "eslint": "^8.48.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.2.2",
    "vite": "^4.4.9"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "zod": "^3.22.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.14",
    "@types/uuid": "^9.0.4",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "eslint": "^8.48.0",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```

## Development Workflow

1. **Setup**: `npm install` in root (installs all workspaces)
2. **Development**: `npm run dev` (starts both frontend and backend)
3. **Type Checking**: `npm run type-check` (validates TypeScript across all packages)
4. **Linting**: `npm run lint` (ESLint across all packages)
5. **Building**: `npm run build` (builds for production)

This tech stack provides:
- **Full TypeScript coverage** across the entire application
- **Type-safe WebRTC** implementations
- **Shared type definitions** between frontend and backend
- **Modern development tools** with excellent TypeScript support
- **Production-ready** build and deployment processes
