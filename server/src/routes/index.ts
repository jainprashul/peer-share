import express from 'express';
import { ZodError } from 'zod';
import { GroupManager } from '../managers/GroupManager.js';
import { validateGroupParams, GetGroupParams } from '../validation/schemas.js';

/**
 * REST API routes for PeerShare server
 * Provides HTTP endpoints for basic operations and health checks
 */
export function createRoutes(groupManager: GroupManager): express.Router {
  const router = express.Router();

  /**
   * Health check endpoint
   */
  router.get('/health', (req, res) => {
    const stats = groupManager.getStats();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      stats
    });
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
        createdAt: group.createdAt.toISOString(),
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

  return router;
}
