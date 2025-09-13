# Lerna Setup for PeerShare Monorepo

This document describes the Lerna configuration for the PeerShare monorepo.

## Project Structure

```
peer-share/
├── client/          # React frontend application
├── server/          # Node.js backend server
├── shared/          # Shared types and utilities
└── package.json     # Root package with Lerna configuration
```

## Packages

- `@peer-share/client` - React frontend application
- `@peer-share/server` - Node.js backend server with WebRTC signaling
- `@peer-share/shared` - Shared types and utilities

## Available Scripts

### Root Level Commands

- `yarn bootstrap` - Install dependencies and link packages
- `yarn clean` - Remove node_modules from all packages
- `yarn build` - Build all packages
- `yarn dev` - Run development servers for all packages in parallel
- `yarn test` - Run tests for all packages
- `yarn lint` - Run linting for all packages

### Package Management

- `yarn version` - Version packages (with conventional commits)
- `yarn publish` - Publish packages to npm
- `yarn changed` - List packages that have changed
- `yarn diff` - Show diff for changed packages

### Advanced Commands

- `yarn exec <command>` - Execute command in all packages
- `yarn run <script>` - Run specific script in all packages
- `yarn add <package>` - Add dependency to specific package
- `yarn link` - Link packages together

## Getting Started

1. Install dependencies and bootstrap the monorepo:
   ```bash
   yarn install
   yarn bootstrap
   ```

2. Start development servers:
   ```bash
   yarn dev
   ```

3. Build all packages:
   ```bash
   yarn build
   ```

## Configuration

- **Lerna Config**: `lerna.json` - Main Lerna configuration
- **Workspaces**: Defined in root `package.json`
- **Versioning**: Independent versioning for each package
- **Publishing**: Conventional commits enabled

## Package Dependencies

The `@peer-share/shared` package is used by both client and server packages to share common types and utilities. This ensures type safety across the entire application.

## Development Workflow

1. Make changes to any package
2. Use `yarn changed` to see which packages have been modified
3. Use `yarn build` to build all packages
4. Use `yarn dev` to run development servers
5. Use `yarn version` to create new versions when ready to release

