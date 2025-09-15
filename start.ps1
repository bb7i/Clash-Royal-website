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

# No Docker mode
Write-Host "`n⏳ Preparing environment (no Docker)..." -ForegroundColor Yellow
Write-Host "Ensure PostgreSQL and Redis are running locally." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Install dependencies if needed
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow

$services = @(
    ".",              # root game service
    "notification-service",
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

$jobs += Start-Service "Game Service" "." "3005"
Start-Sleep -Seconds 2

$jobs += Start-Service "Notification Service" "notification-service" "3006"
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
