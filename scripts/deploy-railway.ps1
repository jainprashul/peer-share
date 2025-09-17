# PowerShell script for Railway deployment
# Run this script to deploy your peer-share app to Railway

param(
    [string]$Environment = "production",
    [switch]$SkipBuild = $false,
    [switch]$Force = $false
)

Write-Host "🚀 Starting Railway deployment for peer-share..." -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "   or visit: https://docs.railway.app/develop/cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    $user = railway whoami
    Write-Host "✅ Logged in as: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Railway. Please run: railway login" -ForegroundColor Red
    exit 1
}

# Build the application if not skipped
if (-not $SkipBuild) {
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    
    # Clean previous builds
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Host "🧹 Cleaned previous build" -ForegroundColor Yellow
    }
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    yarn install --frozen-lockfile
    
    # Build the application
    Write-Host "🏗️ Building client and server..." -ForegroundColor Yellow
    yarn build:prod
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping build (--SkipBuild flag used)" -ForegroundColor Yellow
}

# Deploy to Railway
Write-Host "🚀 Deploying to Railway ($Environment environment)..." -ForegroundColor Yellow

if ($Force) {
    railway up --detach --environment $Environment
} else {
    railway up --detach --environment $Environment
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get deployment URL
    $url = railway domain
    if ($url) {
        Write-Host "🌐 Your app is available at: https://$url" -ForegroundColor Cyan
    }
    
    # Show logs
    Write-Host "📋 Recent logs:" -ForegroundColor Yellow
    railway logs --tail 10
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the logs above for more details." -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Railway deployment completed!" -ForegroundColor Green
