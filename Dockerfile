# Multi-stage build for peer-share application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY . .

# Build the application
RUN yarn build:prod

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 peer-share

# Copy built application
COPY --from=builder --chown=peer-share:nodejs /app/build ./build
COPY --from=builder --chown=peer-share:nodejs /app/package.json ./
COPY --from=builder --chown=peer-share:nodejs /app/yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile && yarn cache clean

USER peer-share

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["yarn", "start"]
