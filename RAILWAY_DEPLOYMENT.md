# Railway Deployment Guide for PeerShare

This guide will help you deploy your PeerShare application to Railway, a modern cloud platform for deploying applications.

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- [Node.js 18+](https://nodejs.org/) installed
- [Yarn](https://yarnpkg.com/) package manager
- Git repository with your code

## Quick Start

### 1. Initial Setup

Run the setup script to initialize your Railway project:

```powershell
.\scripts\railway-setup.ps1
```

This will:
- Install Railway CLI (if not already installed)
- Log you into Railway
- Create a new project
- Set up environment variables
- Generate secure secrets

### 2. Deploy Your Application

Deploy your application to Railway:

```powershell
.\scripts\deploy-railway.ps1
```

This will:
- Build your application (client + server)
- Deploy to Railway
- Show deployment URL and logs

## Manual Deployment

If you prefer to deploy manually:

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Project

```bash
railway init peer-share
```

### 4. Set Environment Variables

```bash
# Required variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set WS_HOST=0.0.0.0

# Optional variables
railway variables set JWT_SECRET=your-jwt-secret
railway variables set SESSION_SECRET=your-session-secret
railway variables set CORS_ORIGIN=https://your-app.railway.app
```

### 5. Deploy

```bash
railway up
```

## Configuration Files

### Railway Configuration

- `railway.json` - Railway build and deploy configuration
- `railway.toml` - Alternative TOML configuration
- `Dockerfile` - Container configuration for deployment

### Environment Variables

- `env.example` - Template for environment variables
- `railway.env` - Railway-specific environment variables

## Project Structure

```
peer-share/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # Shared utilities
├── scripts/                # Deployment scripts
│   ├── deploy-railway.ps1  # PowerShell deployment script
│   └── railway-setup.ps1   # PowerShell setup script
├── railway.json            # Railway configuration
├── railway.toml            # Alternative Railway config
├── Dockerfile              # Container configuration
├── env.example             # Environment variables template
└── RAILWAY_DEPLOYMENT.md   # This guide
```

## Health Checks

Your application includes several health check endpoints:

- `GET /health` - Comprehensive health check with stats
- `GET /health/live` - Liveness probe for Railway
- `GET /health/ready` - Readiness probe for Railway

## Monitoring

### View Logs

```bash
railway logs
```

### View Metrics

```bash
railway metrics
```

### Check Status

```bash
railway status
```

## Custom Domain

To set up a custom domain:

1. Go to your Railway dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain
5. Update CORS_ORIGIN environment variable

## Environment Management

### Production Environment

```bash
railway up --environment production
```

### Staging Environment

```bash
railway up --environment staging
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Ensure all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures**
   - Verify environment variables are set
   - Check Railway logs for errors
   - Ensure port configuration is correct

3. **Health Check Failures**
   - Verify server is running on correct port
   - Check if all required services are initialized
   - Review application logs

### Debug Commands

```bash
# Check Railway status
railway status

# View recent logs
railway logs --tail 50

# Connect to service shell
railway shell

# Check environment variables
railway variables
```

## Advanced Configuration

### Docker Configuration

The included `Dockerfile` uses a multi-stage build:

1. **Dependencies stage** - Installs all dependencies
2. **Build stage** - Builds the application
3. **Production stage** - Creates optimized production image

### Build Optimization

- Uses Alpine Linux for smaller image size
- Multi-stage build to reduce final image size
- Non-root user for security
- Health checks included

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `WS_HOST` | WebSocket host | `0.0.0.0` | Yes |
| `WS_PORT` | WebSocket port | `3001` | No |
| `CORS_ORIGIN` | CORS allowed origin | Railway domain | Yes |
| `JWT_SECRET` | JWT signing secret | Generated | No |
| `SESSION_SECRET` | Session secret | Generated | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp)

## License

This deployment configuration is part of the PeerShare project and follows the same license terms.
