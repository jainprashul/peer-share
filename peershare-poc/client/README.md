# PeerShare POC - Frontend Client

## Overview

This is the React + TypeScript frontend for the PeerShare Phase 1 Proof of Concept. The frontend provides a clean, functional interface for group-based P2P video calling with minimal UI focus as specified in the Phase 1 requirements.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.1.13
- **P2P Communication**: PeerJS 1.5.5
- **Real-time Communication**: Socket.IO Client 4.8.1
- **Linting**: ESLint 9.33.0

## 📁 Project Structure

```
client/
├── src/
│   ├── components/           # React components
│   │   ├── LandingPage.tsx   # Group creation form
│   │   ├── GroupPage.tsx     # Member list and call controls
│   │   └── CallPage.tsx      # Video calling interface
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Client-specific types
│   ├── hooks/                # Custom React hooks (ready for implementation)
│   ├── services/             # API and service layer (ready for implementation)
│   ├── utils/                # Utility functions (ready for implementation)
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles with Tailwind
├── public/                   # Static assets
├── dist/                     # Production build output
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## 🎯 Phase 1 Features Implemented

### ✅ Core UI Components

1. **Landing Page** (`LandingPage.tsx`)
   - Group creation form with group name and username fields
   - Clean, responsive design with Tailwind CSS
   - Form validation and loading states
   - Phase 1 feature overview for users

2. **Group Page** (`GroupPage.tsx`)
   - Real-time member list display
   - Group information (ID, creation time)
   - Call initiation button (visible when exactly 2 members)
   - Member status indicators (online, ready for calls)
   - Leave group functionality
   - User guidance for invite sharing

3. **Call Page** (`CallPage.tsx`)
   - Full-screen video interface
   - Local video (picture-in-picture style)
   - Remote video (main display)
   - Call controls:
     - Mute/unmute audio
     - Enable/disable video
     - Screen sharing toggle
     - End call
   - Connection status indicators
   - Responsive video layout

### ✅ TypeScript Integration

- **Shared Types** (`../shared/types/index.ts`)
  - User and Group interfaces
  - Socket.IO event types (client-to-server and server-to-client)
  - Call state management types
  - Form interfaces
  - PeerJS configuration types

- **Client-Specific Types** (`src/types/index.ts`)
  - App state management
  - Component prop types
  - Video controls state
  - Media permissions interface

### ✅ Styling & UI Framework

- **Tailwind CSS** configured with PostCSS
- Responsive design principles
- Clean, modern interface
- Focus on functionality over aesthetics (Phase 1 requirement)
- Consistent color scheme and spacing
- Accessible button states and indicators

## 🔧 Configuration

### Tailwind CSS Setup
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### PostCSS Configuration
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### TypeScript Configuration
- Strict type checking enabled
- Type-only imports for better tree shaking
- Proper module resolution for monorepo structure

## 📦 Dependencies

### Production Dependencies
```json
{
  "peerjs": "^1.5.5",           // WebRTC P2P connections
  "react": "^19.1.1",           // UI framework
  "react-dom": "^19.1.1",       // React DOM rendering
  "socket.io-client": "^4.8.1"  // Real-time communication
}
```

### Development Dependencies
```json
{
  "@types/peerjs": "^0.0.30",           // PeerJS TypeScript types
  "@tailwindcss/postcss": "^1.0.7",     // Tailwind PostCSS plugin
  "autoprefixer": "^10.4.21",           // CSS vendor prefixing
  "tailwindcss": "^4.1.13",             // Utility-first CSS framework
  "typescript": "~5.8.3",               // TypeScript compiler
  "vite": "^7.1.2"                      // Build tool and dev server
}
```

## 🎨 UI Components Overview

### Landing Page Features
- Group name input with validation
- Username input with validation
- Create group button with loading state
- Phase 1 features overview
- Responsive form layout
- Error handling display

### Group Page Features
- Dynamic member list with avatars
- Real-time member status updates
- Call button (enabled when 2 members present)
- Group information display
- Leave group functionality
- Invite URL sharing guidance
- Status messages for different scenarios

### Call Page Features
- Full-screen video layout
- Picture-in-picture local video
- Call control buttons with hover states
- Visual feedback for muted/disabled states
- Connection status indicators
- Responsive video containers
- Professional call interface

## 🔄 State Management

The application uses React's built-in state management with hooks:

- **App State**: Current page routing, loading states, error handling
- **Form State**: Group creation and join form data
- **Call State**: Video streams, peer connections, control states
- **Group State**: Member list, group information, connection status

## 🚧 Ready for Implementation

The following areas are structured and ready for Phase 1 implementation:

1. **Services Layer** (`src/services/`)
   - Socket.IO connection management
   - PeerJS peer management
   - API communication helpers

2. **Custom Hooks** (`src/hooks/`)
   - `useSocket` - Socket.IO connection and events
   - `usePeer` - PeerJS peer management
   - `useMedia` - Camera/microphone/screen access
   - `useCall` - Call state management

3. **Utilities** (`src/utils/`)
   - Media stream helpers
   - Error handling utilities
   - Validation functions
   - Constants and configuration

## 🎯 Phase 1 Limitations (By Design)

- **Desktop Only**: No mobile responsiveness (Phase 1 requirement)
- **2 Users Maximum**: Group calling limited to 2 participants
- **Basic Error Handling**: Simple error messages only
- **No Persistence**: No local storage or offline capabilities
- **Modern Browsers Only**: Chrome 90+, Firefox 88+, Safari 14+

## 🔍 Development Notes

### Build Process
- TypeScript compilation with strict checking
- Vite bundling with tree shaking
- CSS processing with Tailwind and PostCSS
- Development server with hot module replacement

### Code Quality
- ESLint configuration for code consistency
- TypeScript strict mode enabled
- Type-only imports for better performance
- Component prop validation with TypeScript

### Performance Considerations
- Lazy loading ready for implementation
- Optimized bundle size with Vite
- Efficient re-rendering with React hooks
- Minimal dependencies for Phase 1

## 🚀 Next Steps

1. **Backend Integration**: Connect to Socket.IO server
2. **PeerJS Implementation**: WebRTC P2P video calling
3. **Media Access**: Camera, microphone, and screen sharing
4. **Error Handling**: User-friendly error messages
5. **Testing**: Manual testing scenarios for Phase 1

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:5173

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🎨 Styling Guidelines

- Use Tailwind utility classes for styling
- Maintain consistent spacing (4, 6, 8, 12 units)
- Use semantic color names (blue-600, red-600, etc.)
- Focus on functionality over visual polish (Phase 1)
- Ensure good contrast for accessibility
- Responsive breakpoints: sm, md, lg, xl

This frontend foundation provides everything needed to implement the Phase 1 POC features as specified in the requirements document.