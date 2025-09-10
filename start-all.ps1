# ClashRoyale.Web - Start All Services
# This script starts all services for development

Write-Host "🚀 Starting ClashRoyale.Web - All Services..." -ForegroundColor Green

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or not installed. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Start infrastructure services
Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if services are running
$postgresStatus = docker-compose -f docker-compose.dev.yml ps postgres | Select-String "Up"
$redisStatus = docker-compose -f docker-compose.dev.yml ps redis | Select-String "Up"

if ($postgresStatus -and $redisStatus) {
    Write-Host "✅ Infrastructure services are running" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start infrastructure services" -ForegroundColor Red
    exit 1
}

# Install dependencies for all services
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Auth Service
Write-Host "Installing Auth Service dependencies..." -ForegroundColor Cyan
Set-Location services/auth-service
npm install
Set-Location ../..

# User Service
Write-Host "Installing User Service dependencies..." -ForegroundColor Cyan
Set-Location services/user-service
npm install
Set-Location ../..

# Deck Service
Write-Host "Installing Deck Service dependencies..." -ForegroundColor Cyan
Set-Location services/deck-service
npm install
Set-Location ../..

# Matchmaking Service
Write-Host "Installing Matchmaking Service dependencies..." -ForegroundColor Cyan
Set-Location services/matchmaking-service
npm install
Set-Location ../..

# Game Service
Write-Host "Installing Game Service dependencies..." -ForegroundColor Cyan
Set-Location services/game-service
npm install
Set-Location ../..

# Notification Service
Write-Host "Installing Notification Service dependencies..." -ForegroundColor Cyan
Set-Location services/notification-service
npm install
Set-Location ../..

# Frontend
Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "✅ All dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "🎮 ClashRoyale.Web is ready to start!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 To start all services, run these commands in separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - Auth Service:" -ForegroundColor White
Write-Host "  cd services/auth-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 2 - User Service:" -ForegroundColor White
Write-Host "  cd services/user-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 3 - Deck Service:" -ForegroundColor White
Write-Host "  cd services/deck-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 4 - Matchmaking Service:" -ForegroundColor White
Write-Host "  cd services/matchmaking-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 5 - Game Service:" -ForegroundColor White
Write-Host "  cd services/game-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 6 - Notification Service:" -ForegroundColor White
Write-Host "  cd services/notification-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 7 - Frontend:" -ForegroundColor White
Write-Host "  cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "  API Gateway: http://localhost:80" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 To stop infrastructure services:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host ""
