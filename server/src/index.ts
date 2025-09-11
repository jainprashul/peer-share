import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { GroupManager } from './managers/GroupManager.js';
import { WebSocketHandler } from './socket/WebSocketHandler.js';
import { createRoutes } from './routes/index.js';
import { UserWebSocket } from './types/index.js';
import { validateEnvironment, EnvConfig } from './validation/schemas.js';

/**
 * PeerShare POC Server - Phase 1 Implementation
 * WebSocket-based signaling server for P2P video calling
 */

// Validate and parse environment variables with Zod
const config: EnvConfig = validateEnvironment(process.env);
const { PORT, WS_PORT, NODE_ENV, ALLOWED_ORIGINS } = config;

// Initialize core components
const app = express();
const groupManager = new GroupManager();
const websocketHandler = new WebSocketHandler(groupManager);

// Express middleware
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3000']
    : ALLOWED_ORIGINS?.split(',') || [],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// API routes
app.use('/api', createRoutes(groupManager));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    name: 'PeerShare POC Server',
    version: '1.0.0',
    status: 'running',
    websocketPort: WS_PORT,
    environment: NODE_ENV
  });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  port: Number(WS_PORT),
  perMessageDeflate: {
    concurrencyLimit: 10
  }
});

console.log(`WebSocket server starting on port ${WS_PORT}`);

// Handle WebSocket connections
wss.on('connection', (ws: UserWebSocket, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`New WebSocket connection from ${clientIp}`);
  
  websocketHandler.handleConnection(ws);
});

// Start connection health monitoring
websocketHandler.startHealthCheck(wss);

// Start HTTP server
server.listen(PORT, () => {
  console.log(`
🚀 PeerShare POC Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HTTP Server:     http://localhost:${PORT}
WebSocket Server: ws://localhost:${WS_PORT}
Environment:     ${NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

export { app, server, wss, groupManager };
