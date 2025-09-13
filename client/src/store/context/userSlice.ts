import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User, type Group } from '@peer-share/shared';

interface UserState {
  // Connection state
  isConnected: boolean;
  
  // User and group data
  currentUser: User | null;
  currentGroup: Group | null;
  members: User[];
  
  // Call state
  isInCall: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Controls state
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  
}

const initialState: UserState = {
  isConnected: false,
  currentUser: null,
  currentGroup: null,
  members: [],
  isInCall: false,
  isConnecting: false,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isVideoEnabled: true,
  isScreenSharing: false,
 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Connection management
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    
    // User and group management
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    
    setMembers: (state, action: PayloadAction<User[]>) => {
      state.members = action.payload;
    },
    
    addMember: (state, action: PayloadAction<User>) => {
      const existingIndex = state.members.findIndex(m => m.id === action.payload.id);
      if (existingIndex === -1) {
        state.members.push(action.payload);
      } else {
        state.members[existingIndex] = action.payload;
      }
    },
    
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(m => m.id !== action.payload);
    },
    
    // Call management
    setInCall: (state, action: PayloadAction<boolean>) => {
      state.isInCall = action.payload;
    },
    
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.localStream = action.payload;
    },
    
    setRemoteStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.remoteStream = action.payload;
    },
    
    // Controls
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    
    setVideoEnabled: (state, action: PayloadAction<boolean>) => {
      state.isVideoEnabled = action.payload;
    },
    
    setScreenSharing: (state, action: PayloadAction<boolean>) => {
      state.isScreenSharing = action.payload;
    },
    
    // Reset state
    resetState: () => initialState
  }
});

export const userActions = userSlice.actions;

export default userSlice.reducer;
