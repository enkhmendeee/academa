# Backend Deployment Script for Fly.io
Write-Host "🚀 Starting backend deployment..." -ForegroundColor Green

# Check if we're in the server directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the server directory" -ForegroundColor Red
    exit 1
}

# Check if fly CLI is installed
try {
    fly version | Out-Null
    Write-Host "✅ Fly CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Fly CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    fly auth whoami | Out-Null
    Write-Host "✅ Logged in to Fly.io" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Fly.io. Please run:" -ForegroundColor Red
    Write-Host "   fly auth login" -ForegroundColor Yellow
    exit 1
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Fly.io
Write-Host "🚀 Deploying to Fly.io..." -ForegroundColor Yellow
try {
    fly deploy
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Check status
Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
fly status

# Test health endpoint
Write-Host "🏥 Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://academaa.fly.dev/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "🎉 Backend is ready at: https://academaa.fly.dev" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Health check failed, but deployment completed" -ForegroundColor Yellow
    Write-Host "Check logs with: fly logs" -ForegroundColor Yellow
}

Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   fly logs          - View logs" -ForegroundColor White
Write-Host "   fly status        - Check status" -ForegroundColor White
Write-Host "   fly open          - Open in browser" -ForegroundColor White
