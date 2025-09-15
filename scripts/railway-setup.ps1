# PowerShell script to set up Railway project
# Run this script to initialize your Railway project

param(
    [string]$ProjectName = "peer-share",
    [string]$Environment = "production"
)

Write-Host "🚀 Setting up Railway project for peer-share..." -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
        exit 1
    }
}

# Login to Railway
Write-Host "🔐 Logging in to Railway..." -ForegroundColor Yellow
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to Railway" -ForegroundColor Red
    exit 1
}

# Create new project or link to existing
Write-Host "📁 Setting up project..." -ForegroundColor Yellow
railway init $ProjectName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize Railway project" -ForegroundColor Red
    exit 1
}

# Set environment variables
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Yellow

# Set production environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set WS_HOST=0.0.0.0
railway variables set CORS_ORIGIN=https://$ProjectName.railway.app

# Optional: Set up custom domain
$customDomain = Read-Host "Enter custom domain (optional, press Enter to skip)"
if ($customDomain) {
    railway domain $customDomain
    railway variables set CORS_ORIGIN=https://$customDomain
}

# Generate secrets
Write-Host "Generating secrets..." -ForegroundColor Yellow
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
$sessionSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)

railway variables set JWT_SECRET=$jwtSecret
railway variables set SESSION_SECRET=$sessionSecret

Write-Host "Railway project setup completed!" -ForegroundColor Green
Write-Host "Project details:" -ForegroundColor Cyan
Write-Host "Project Name: $ProjectName" -ForegroundColor White
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Domain: https://$ProjectName.railway.app" -ForegroundColor White

Write-Host "Ready to deploy! Run: .\scripts\deploy-railway.ps1" -ForegroundColor Green