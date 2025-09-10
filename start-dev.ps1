# ClashRoyale.Web Development Startup Script
# This script starts the development environment

Write-Host "🚀 Starting ClashRoyale.Web Development Environment..." -ForegroundColor Green

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

# Start infrastructure services (PostgreSQL and Redis)
Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
$postgresStatus = docker-compose -f docker-compose.dev.yml ps postgres | Select-String "Up"
$redisStatus = docker-compose -f docker-compose.dev.yml ps redis | Select-String "Up"

if ($postgresStatus -and $redisStatus) {
    Write-Host "✅ Infrastructure services are running" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start infrastructure services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎮 ClashRoyale.Web Development Environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Install dependencies for each service:" -ForegroundColor White
Write-Host "   cd services/auth-service && npm install" -ForegroundColor Gray
Write-Host "   cd services/user-service && npm install" -ForegroundColor Gray
Write-Host "   cd frontend && npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the services:" -ForegroundColor White
Write-Host "   # Terminal 1 - Auth Service" -ForegroundColor Gray
Write-Host "   cd services/auth-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Terminal 2 - User Service" -ForegroundColor Gray
Write-Host "   cd services/user-service && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Terminal 3 - Frontend" -ForegroundColor Gray
Write-Host "   cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   API Gateway: http://localhost:80" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 To stop the infrastructure services:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host ""
