# Multi-stage build for peer-share application
FROM node:20-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN yarn

# Build the application
RUN yarn build:prod

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 peer-share

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown peer-share:nodejs /app/logs

# Copy built application
COPY --from=builder --chown=peer-share:nodejs /app/build ./build

# Run as non-root user
USER peer-share

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_DIR=/app/logs
ENV DISABLE_FILE_LOGGING=false
# Alternative: Set DISABLE_FILE_LOGGING=true for console-only logging in restricted environments

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "build/server/index.js"]