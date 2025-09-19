import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { GroupManager } from './managers/GroupManager';
import { WebSocketHandler } from './socket/WebSocketHandler';
import { createRoutes } from './routes/index';
import { UserWebSocket } from './types/index';
import { validateEnvironment, EnvConfig } from './validation/schemas';
import { logger } from './utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * PeerShare POC Server - Phase 1 Implementation
 * WebSocket-based signaling server for P2P video calling
 */
// Validate and parse environment variables with Zod
const config: EnvConfig = validateEnvironment(process.env);
const { PORT, NODE_ENV, ALLOWED_ORIGINS } = config;

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

// Serve client build files
app.use(express.static('./build/client'));

// Debug middleware to log requests
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', createRoutes(groupManager));

// Basic route for testing

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './build/client' });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server attached to the same HTTP server
const wss = new WebSocketServer({ 
  server,
  path: '/ws',
  perMessageDeflate: {
    concurrencyLimit: 10
  }
});

logger.log(`WebSocket server starting on same port as HTTP server (${PORT})`);

// Handle WebSocket connections
wss.on('connection', (ws: UserWebSocket, req) => {
  const clientIp = req.socket.remoteAddress;
  logger.log(`New WebSocket connection from ${clientIp}`);

  // Give the client a unique ID
  const clientId = `user_${uuidv4()}`;
  ws.userId = clientId;
  
  websocketHandler.handleConnection(ws);
});

// Start connection health monitoring
websocketHandler.startHealthCheck(wss);

// Start HTTP server
server.listen(PORT, () => {
  logger.log(`
🚀 PeerShare POC Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HTTP Server:     http://localhost:${PORT}
WebSocket Server: ws://localhost:${PORT}
Environment:     ${NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  logger.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Close WebSocket server
  wss.close(() => {
    logger.log('WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    logger.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

export { app, server, wss, groupManager };
