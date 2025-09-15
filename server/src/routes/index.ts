import express from 'express';
import { ZodError } from 'zod';
import { GroupManager } from '../managers/GroupManager';
import { validateGroupParams, GetGroupParams } from '../validation/schemas';

/**
 * REST API routes for PeerShare server
 * Provides HTTP endpoints for basic operations and health checks
 */
export function createRoutes(groupManager: GroupManager): express.Router {
  const router = express.Router();

  /**
   * Health check endpoint for Railway
   */
  router.get('/health', (req, res) => {
    const stats = groupManager.getStats();
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      stats
    };
    
    res.status(200).json(health);
  });

  /**
   * Liveness probe for Railway
   */
  router.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  });

  /**
   * Readiness probe for Railway
   */
  router.get('/health/ready', (req, res) => {
    // Check if the server is ready to accept connections
    const isReady = groupManager !== null;
    
    if (isReady) {
      res.status(200).json({ 
        status: 'ready', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } else {
      res.status(503).json({ 
        status: 'not ready', 
        timestamp: new Date().toISOString() 
      });
    }
  });

  /**
   * Get group information (for sharing links)
   */
  router.get('/group/:groupId', (req, res) => {
    try {
      const params: GetGroupParams = validateGroupParams(req.params);
      const group = groupManager.getGroup(params.groupId);
      
      if (!group) {
        return res.status(404).json({
          error: 'Group not found',
          code: 'GROUP_NOT_FOUND'
        });
      }

      // Return public group information (no sensitive data)
      res.json({
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        memberCount: group.members.size,
        exists: true
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid group ID format',
          code: 'INVALID_GROUP_ID',
          details: error.errors
        });
      }
      
      console.error('Error getting group info:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Validate group exists for client-side routing
   */
  router.head('/group/:groupId', (req, res) => {
    try {
      const params: GetGroupParams = validateGroupParams(req.params);
      const group = groupManager.getGroup(params.groupId);
      
      if (!group) {
        return res.status(404).end();
      }

      res.status(200).end();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).end();
      }
      
      console.error('Error validating group:', error);
      res.status(500).end();
    }
  });

  /**
   * Get server statistics (for monitoring)
   */
  router.get('/stats', (req, res) => {
    const stats = groupManager.getStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  router.get('/', (req, res) => {
    {
      res.json({
        name: 'PeerShare POC Server',
        version: '1.0.0',
        status: 'running',
        websocketPort: process.env.WS_PORT,
        environment: process.env.NODE_ENV
      });
    }
  });

  return router;
}
