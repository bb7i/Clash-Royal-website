# Test Services Script
Write-Host "🧪 Testing ClashRoyale.Web Services..." -ForegroundColor Green

# Test Auth Service
Write-Host "`n🔐 Testing Auth Service..." -ForegroundColor Yellow
Set-Location services\auth-service
try {
    npm run dev
    Write-Host "✅ Auth Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service failed to start" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Set-Location ..\..

# Test User Service
Write-Host "`n👤 Testing User Service..." -ForegroundColor Yellow
Set-Location services\user-service
try {
    npm install
    npm run dev
    Write-Host "✅ User Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ User Service failed to start" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Set-Location ..\..

Write-Host "`n🎯 Service testing completed!" -ForegroundColor Green
