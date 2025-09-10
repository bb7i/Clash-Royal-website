# Check Requirements Script
Write-Host "🔍 Checking ClashRoyale.Web Requirements..." -ForegroundColor Green

$allGood = $true

# Check Node.js
Write-Host "`n📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "`n📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm not found" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check Docker
Write-Host "`n🐳 Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker not found" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    $allGood = $false
}

# Check Docker Compose
Write-Host "`n🐳 Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose not found" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    $allGood = $false
}

# Check ports
Write-Host "`n🔌 Checking ports..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 3003, 3004, 3005, 3006, 80, 5432, 6379)
$usedPorts = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $usedPorts += $port
    }
}

if ($usedPorts.Count -eq 0) {
    Write-Host "✅ All required ports are available" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some ports are in use: $($usedPorts -join ', ')" -ForegroundColor Yellow
    Write-Host "   You may need to stop other applications using these ports" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ All requirements are met! You can proceed with installation." -ForegroundColor Green
    Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\start-dev.ps1" -ForegroundColor White
    Write-Host "2. Or follow the manual setup in SETUP.md" -ForegroundColor White
} else {
    Write-Host "❌ Some requirements are missing. Please install them first." -ForegroundColor Red
    Write-Host "`n📖 See SETUP.md for detailed installation instructions." -ForegroundColor Yellow
}

Write-Host "`n🎮 ClashRoyale.Web Setup Check Complete!" -ForegroundColor Green
