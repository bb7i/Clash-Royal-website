# ClashRoyale.Web - Quick Start Script
Write-Host "🚀 ClashRoyale.Web - Quick Start" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n🔍 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found!" -ForegroundColor Red
        Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "Then restart this script." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then restart this script." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is installed
Write-Host "`n🔍 Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker not found!" -ForegroundColor Red
        Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "Then restart this script." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "❌ Docker not found!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "Then restart this script." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n🎯 All requirements met! Starting setup..." -ForegroundColor Green

# Start Docker services
Write-Host "`n🐳 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Wait for services
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

$services = @(
    "services\auth-service",
    "services\user-service", 
    "services\deck-service",
    "services\matchmaking-service",
    "services\game-service",
    "services\notification-service",
    "frontend"
)

foreach ($service in $services) {
    Write-Host "Installing $service..." -ForegroundColor Cyan
    Set-Location $service
    npm install --silent
    Set-Location ..\..
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n🎮 To start the game:" -ForegroundColor Yellow
Write-Host "1. Open 7 separate terminals" -ForegroundColor White
Write-Host "2. Run each service in its own terminal:" -ForegroundColor White
Write-Host "   - Terminal 1: cd services\auth-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 2: cd services\user-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 3: cd services\deck-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 4: cd services\matchmaking-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 5: cd services\game-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 6: cd services\notification-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 7: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host "`n3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "`n🎯 Game ready to play!" -ForegroundColor Green

Read-Host "`nPress Enter to exit"
