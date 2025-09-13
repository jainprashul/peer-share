import { v4 as uuidv4 } from 'uuid';
import {User, ErrorCodes, Group } from '../types/index';
import { UsernameSchema, GroupNameSchema } from '../validation/schemas';

/**
 * GroupManager handles in-memory storage and operations for groups and users
 * Based on Phase 1 specification requirements
 */
export class GroupManager {
  private groups = new Map<string, Group>();
  private users = new Map<string, User>();

  /**
   * Create a new group with the specified name and creator
   */
  createGroup(name: string, creatorUsername: string, websocket: any): { groupId: string; user: User } {
    // Validate inputs with Zod
    const validatedGroupName = GroupNameSchema.parse(name);
    const validatedUsername = UsernameSchema.parse(creatorUsername);

    const groupId = uuidv4();
    const userId = uuidv4();
    
    // Create user
    const user: User = {
      id: userId,
      username: validatedUsername,
      websocket,
      groupId
    };

    // Create group with empty members map
    const group: Group = {
      id: groupId,
      name: validatedGroupName,
      createdAt: new Date(),
      members: new Map()
    };

    // Add creator to group
    group.members.set(userId, user);
    
    // Store in maps
    this.groups.set(groupId, group);
    this.users.set(userId, user);

    console.log(`Group created: ${groupId} with creator: ${validatedUsername}`);
    
    return { groupId, user };
  }

  /**
   * Join an existing group
   */
  joinGroup(groupId: string, username: string, websocket: any, peerId?: string): User {
    // Validate inputs - groupId validation happens at WebSocket handler level
    const validatedUsername = UsernameSchema.parse(username);

    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(ErrorCodes.GROUP_NOT_FOUND);
    }

    // Check if username is already taken in this group
    let finalUsername = validatedUsername;
    const existingUserWithName = Array.from(group.members.values())
      .find(member => member.username.toLowerCase() === finalUsername.toLowerCase());
    
    if (existingUserWithName) {
      // Auto-increment username to make it unique
      let counter = 1;
      let newUsername = `${validatedUsername}${counter}`;
      while (Array.from(group.members.values())
        .some(member => member.username.toLowerCase() === newUsername.toLowerCase())) {
        counter++;
        newUsername = `${validatedUsername}${counter}`;
      }
      finalUsername = newUsername;
    }

    const userId = uuidv4();
    
    // Create user
    const user: User = {
      id: userId,
      username: finalUsername,
      websocket,
      groupId,
      peerId
    };

    // Add to group
    group.members.set(userId, user);
    this.users.set(userId, user);

    console.log(`User ${finalUsername} joined group: ${groupId}`);
    
    return user;
  }

  /**
   * Remove user from their current group
   */
  leaveGroup(userId: string): { group: Group | null; user: User | null } {
    const user = this.users.get(userId);
    if (!user || !user.groupId) {
      return { group: null, user: null };
    }

    const group = this.groups.get(user.groupId);
    if (group) {
      group.members.delete(userId);
      
      // Clean up empty groups
      if (group.members.size === 0) {
        this.groups.delete(group.id);
        console.log(`Empty group ${group.id} removed`);
      }
    }

    this.users.delete(userId);
    console.log(`User ${user.username} left group: ${user.groupId}`);
    
    return { group: group || null, user };
  }

  /**
   * Get all members of a group
   */
  getGroupMembers(groupId: string) {
    const group = this.groups.get(groupId);
    if (!group) {
      return [];
    }
    
    return Array.from(group.members.values()) ;
  }

  /**
   * Get group information by ID
   */
  getGroup(groupId: string): Group | null {
    return this.groups.get(groupId) || null;
  }

  /**
   * Get user information by ID
   */
  getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Update user's peer ID (for WebRTC signaling)
   */
  updateUserPeerId(userId: string, peerId: string): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }
    
    user.peerId = peerId;
    console.log(`Updated peer ID for user ${user.username}: ${peerId}`);
    return true;
  }

  /**
   * Find user by peer ID
   */
  getUserByPeerId(peerId: string): User | null {
    for (const user of this.users.values()) {
      if (user.peerId === peerId) {
        return user;
      }
    }
    return null;
  }

  /**
   * Get all peers in a group (users with peer IDs)
   */
  getGroupPeers(groupId: string): Array<{ peerId: string; username: string }> {
    const group = this.groups.get(groupId);
    if (!group) {
      return [];
    }

    return Array.from(group.members.values())
      .filter(user => user.peerId)
      .map(user => ({
        peerId: user.peerId!,
        username: user.username
      }));
  }

  /**
   * Clean up disconnected users
   */
  cleanupUser(websocket: any): { group: Group | null; user: User | null } {
    // Find user by websocket reference
    for (const [userId, user] of this.users.entries()) {
      if (user.websocket === websocket) {
        return this.leaveGroup(userId);
      }
    }
    return { group: null, user: null };
  }

  /**
   * Get server statistics (for monitoring)
   */
  getStats(): { totalGroups: number; totalUsers: number; averageGroupSize: number } {
    const totalGroups = this.groups.size;
    const totalUsers = this.users.size;
    const averageGroupSize = totalGroups > 0 ? totalUsers / totalGroups : 0;

    return {
      totalGroups,
      totalUsers,
      averageGroupSize: Math.round(averageGroupSize * 100) / 100
    };
  }
}
