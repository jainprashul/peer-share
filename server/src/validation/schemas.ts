import { z } from 'zod';

/**
 * Zod validation schemas for PeerShare POC
 * Provides runtime type safety and validation for all incoming data
 */

// Base schemas for common types
export const UsernameSchema = z.string()
  .min(1, 'Username cannot be empty')
  .max(50, 'Username cannot exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(s => s.trim());

export const GroupNameSchema = z.string()
  .min(1, 'Group name cannot be empty')
  .max(100, 'Group name cannot exceed 100 characters')
  .transform(s => s.trim());

export const GroupIdSchema = z.string()
  .regex(/^group_[a-zA-Z0-9_-]+$/, 'Invalid group ID format');

export const UserIdSchema = z.string()
  .regex(/^user_[a-zA-Z0-9_-]+$/, 'Invalid user ID format');

export const PeerIdSchema = z.string()
  .min(1, 'Peer ID cannot be empty')
  .max(100, 'Peer ID too long');

// WebSocket message base schema
export const BaseMessageSchema = z.object({
  type: z.string(),
  payload: z.any(),
  timestamp: z.number().optional()
});

// Group management message schemas
export const CreateGroupMessageSchema = z.object({
  type: z.literal('create-group'),
  payload: z.object({
    groupName: GroupNameSchema,
    username: UsernameSchema
  }),
  timestamp: z.number().optional()
});

export const JoinGroupMessageSchema = z.object({
  type: z.literal('join-group'),
  payload: z.object({
    groupId: GroupIdSchema,
    username: UsernameSchema,
    peerId: PeerIdSchema.optional()
  }),
  timestamp: z.number().optional()
});

export const LeaveGroupMessageSchema = z.object({
  type: z.literal('leave-group'),
  payload: z.object({
    userId: UserIdSchema
  }),
  timestamp: z.number().optional()
});

export const UpdatePeerIdMessageSchema = z.object({
  type: z.literal('update-peer-id'),
  payload: z.object({
    peerId: PeerIdSchema
  }),
  timestamp: z.number().optional()
});

// P2P/Call message schemas
export const CallRequestMessageSchema = z.object({
  type: z.literal('call-request'),
  payload: z.object({
    targetPeerId: PeerIdSchema,
    fromPeerId: PeerIdSchema,
    fromUsername: UsernameSchema
  }),
  timestamp: z.number().optional()
});

export const CallResponseMessageSchema = z.object({
  type: z.literal('call-response'),
  payload: z.object({
    accepted: z.boolean(),
    fromPeerId: PeerIdSchema,
    toPeerId: PeerIdSchema
  }),
  timestamp: z.number().optional()
});

// Server response schemas
export const GroupCreatedResponseSchema = z.object({
  type: z.literal('group-created'),
  payload: z.object({
    groupId: GroupIdSchema,
    groupName: GroupNameSchema,
    user: z.object({
      id: UserIdSchema,
      username: UsernameSchema
    })
  }),
  timestamp: z.number().optional()
});

export const GroupJoinedResponseSchema = z.object({
  type: z.literal('group-joined'),
  payload: z.object({
    groupId: GroupIdSchema,
    groupName: GroupNameSchema,
    user: z.object({
      id: UserIdSchema,
      username: UsernameSchema
    }),
    members: z.array(z.object({
      id: UserIdSchema,
      username: UsernameSchema,
      peerId: PeerIdSchema.optional()
    }))
  }),
  timestamp: z.number().optional()
});

export const UserJoinedResponseSchema = z.object({
  type: z.literal('user-joined'),
  payload: z.object({
    user: z.object({
      id: UserIdSchema,
      username: UsernameSchema,
      peerId: PeerIdSchema.optional()
    })
  }),
  timestamp: z.number().optional()
});

export const UserLeftResponseSchema = z.object({
  type: z.literal('user-left'),
  payload: z.object({
    userId: UserIdSchema,
    username: UsernameSchema
  }),
  timestamp: z.number().optional()
});

export const ErrorResponseSchema = z.object({
  type: z.literal('error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }),
  timestamp: z.number().optional()
});

// Peer discovery schemas
export const PeerJoinedResponseSchema = z.object({
  type: z.literal('peer-joined'),
  payload: z.object({
    peerId: PeerIdSchema,
    username: UsernameSchema
  }),
  timestamp: z.number().optional()
});

export const ExistingPeersResponseSchema = z.object({
  type: z.literal('existing-peers'),
  payload: z.object({
    peers: z.array(z.object({
      peerId: PeerIdSchema,
      username: UsernameSchema
    }))
  }),
  timestamp: z.number().optional()
});

export const IncomingCallRequestResponseSchema = z.object({
  type: z.literal('incoming-call-request'),
  payload: z.object({
    fromPeerId: PeerIdSchema,
    fromUsername: UsernameSchema
  }),
  timestamp: z.number().optional()
});

// Union schema for all incoming message types
export const IncomingMessageSchema = z.discriminatedUnion('type', [
  CreateGroupMessageSchema,
  JoinGroupMessageSchema,
  LeaveGroupMessageSchema,
  UpdatePeerIdMessageSchema,
  CallRequestMessageSchema,
  CallResponseMessageSchema
]);

// API request schemas
export const GetGroupParamsSchema = z.object({
  groupId: GroupIdSchema
});

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  uptime: z.number().positive(),
  stats: z.object({
    totalGroups: z.number().nonnegative(),
    totalUsers: z.number().nonnegative(),
    averageGroupSize: z.number().nonnegative()
  })
});

export const GroupInfoResponseSchema = z.object({
  id: GroupIdSchema,
  name: GroupNameSchema,
  createdAt: z.string().datetime(),
  memberCount: z.number().nonnegative(),
  exists: z.literal(true)
});

export const NotFoundResponseSchema = z.object({
  error: z.string(),
  code: z.string()
});

// Environment variables schema
export const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().optional(),
  WS_HEARTBEAT_INTERVAL: z.string().regex(/^\d+$/).transform(Number).default('30000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  MONGO_USERNAME: z.string(),
  MONGO_PASSWORD: z.string(),
  MONGO_DB_NAME: z.string(),
  MONGO_CLUSTER_URL: z.string(),

  GOOGLE_ICLIENT_ID: z.string(),
  GOOGLE_CLENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long')

});

// Type exports for use throughout the application
export type CreateGroupMessage = z.infer<typeof CreateGroupMessageSchema>;
export type JoinGroupMessage = z.infer<typeof JoinGroupMessageSchema>;
export type LeaveGroupMessage = z.infer<typeof LeaveGroupMessageSchema>;
export type UpdatePeerIdMessage = z.infer<typeof UpdatePeerIdMessageSchema>;
export type CallRequestMessage = z.infer<typeof CallRequestMessageSchema>;
export type CallResponseMessage = z.infer<typeof CallResponseMessageSchema>;
export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;
export type GroupCreatedResponse = z.infer<typeof GroupCreatedResponseSchema>;
export type GroupJoinedResponse = z.infer<typeof GroupJoinedResponseSchema>;
export type UserJoinedResponse = z.infer<typeof UserJoinedResponseSchema>;
export type UserLeftResponse = z.infer<typeof UserLeftResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PeerJoinedResponse = z.infer<typeof PeerJoinedResponseSchema>;
export type ExistingPeersResponse = z.infer<typeof ExistingPeersResponseSchema>;
export type IncomingCallRequestResponse = z.infer<typeof IncomingCallRequestResponseSchema>;
export type GetGroupParams = z.infer<typeof GetGroupParamsSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type GroupInfoResponse = z.infer<typeof GroupInfoResponseSchema>;
export type NotFoundResponse = z.infer<typeof NotFoundResponseSchema>;
export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validation helper functions
 */

export function validateMessage(data: unknown): IncomingMessage {
  return IncomingMessageSchema.parse(data);
}

export function validateGroupParams(params: unknown): GetGroupParams {
  return GetGroupParamsSchema.parse(params);
}

export function validateEnvironment(env: Record<string, string | undefined>): EnvConfig {
  return EnvSchema.parse(env);
}
