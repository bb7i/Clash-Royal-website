# ClashRoyale.Web - One Command Start
Write-Host "🚀 ClashRoyale.Web - Starting Everything..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

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

# Start Docker services
Write-Host "`n🐳 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Wait for services
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Install dependencies if needed
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow

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
    if (!(Test-Path "$service\node_modules")) {
        Write-Host "Installing $service..." -ForegroundColor Cyan
        Set-Location $service
        npm install --silent
        Set-Location ..\..
    } else {
        Write-Host "✅ $service dependencies already installed" -ForegroundColor Green
    }
}

Write-Host "`n🎮 Starting all services..." -ForegroundColor Yellow

# Function to start service in background
function Start-Service {
    param($serviceName, $servicePath, $port)
    
    Write-Host "Starting $serviceName on port $port..." -ForegroundColor Cyan
    
    $job = Start-Job -ScriptBlock {
        param($path, $serviceName)
        Set-Location $path
        npm run dev
    } -ArgumentList $servicePath, $serviceName
    
    return $job
}

# Start all services
$jobs = @()

$jobs += Start-Service "Auth Service" "services\auth-service" "3001"
Start-Sleep -Seconds 2

$jobs += Start-Service "User Service" "services\user-service" "3002"
Start-Sleep -Seconds 2

$jobs += Start-Service "Deck Service" "services\deck-service" "3003"
Start-Sleep -Seconds 2

$jobs += Start-Service "Matchmaking Service" "services\matchmaking-service" "3004"
Start-Sleep -Seconds 2

$jobs += Start-Service "Game Service" "services\game-service" "3005"
Start-Sleep -Seconds 2

$jobs += Start-Service "Notification Service" "services\notification-service" "3006"
Start-Sleep -Seconds 2

$jobs += Start-Service "Frontend" "frontend" "3000"

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "`n🌐 Access the game:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:80" -ForegroundColor White

Write-Host "`n📊 Service Status:" -ForegroundColor Yellow
Write-Host "   Auth Service: http://localhost:3001/health" -ForegroundColor Gray
Write-Host "   User Service: http://localhost:3002/health" -ForegroundColor Gray
Write-Host "   Deck Service: http://localhost:3003/health" -ForegroundColor Gray
Write-Host "   Matchmaking Service: http://localhost:3004/health" -ForegroundColor Gray
Write-Host "   Game Service: http://localhost:3005/health" -ForegroundColor Gray
Write-Host "   Notification Service: http://localhost:3006/health" -ForegroundColor Gray

Write-Host "`n🎯 Game is ready to play!" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if any job failed
        foreach ($job in $jobs) {
            if ($job.State -eq "Failed") {
                Write-Host "`n❌ Service failed: $($job.Name)" -ForegroundColor Red
                Write-Host "Check logs for details" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "`n🛑 Stopping all services..." -ForegroundColor Yellow
    
    # Stop all jobs
    foreach ($job in $jobs) {
        if ($job.State -eq "Running") {
            Stop-Job $job
            Remove-Job $job
        }
    }
    
    Write-Host "✅ All services stopped" -ForegroundColor Green
    Write-Host "`n🎮 Thanks for playing ClashRoyale.Web!" -ForegroundColor Green
}
