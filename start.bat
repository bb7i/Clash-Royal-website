@echo off
echo 🚀 ClashRoyale.Web - Starting Everything...
echo =========================================

REM Check if Node.js is installed
echo.
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart this script.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if Docker is installed
echo.
echo 🔍 Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo Then restart this script.
    pause
    exit /b 1
)
echo ✅ Docker found

REM Start Docker services
echo.
echo 🐳 Starting PostgreSQL and Redis...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Install dependencies if needed
echo.
echo 📦 Checking dependencies...

if not exist "services\auth-service\node_modules" (
    echo Installing auth-service...
    cd services\auth-service
    npm install --silent
    cd ..\..
)

if not exist "services\user-service\node_modules" (
    echo Installing user-service...
    cd services\user-service
    npm install --silent
    cd ..\..
)

if not exist "services\deck-service\node_modules" (
    echo Installing deck-service...
    cd services\deck-service
    npm install --silent
    cd ..\..
)

if not exist "services\matchmaking-service\node_modules" (
    echo Installing matchmaking-service...
    cd services\matchmaking-service
    npm install --silent
    cd ..\..
)

if not exist "services\game-service\node_modules" (
    echo Installing game-service...
    cd services\game-service
    npm install --silent
    cd ..\..
)

if not exist "services\notification-service\node_modules" (
    echo Installing notification-service...
    cd services\notification-service
    npm install --silent
    cd ..\..
)

if not exist "frontend\node_modules" (
    echo Installing frontend...
    cd frontend
    npm install --silent
    cd ..
)

echo.
echo 🎮 Starting all services...

REM Start all services in background
start "Auth Service" cmd /k "cd services\auth-service && npm run dev"
timeout /t 2 /nobreak >nul

start "User Service" cmd /k "cd services\user-service && npm run dev"
timeout /t 2 /nobreak >nul

start "Deck Service" cmd /k "cd services\deck-service && npm run dev"
timeout /t 2 /nobreak >nul

start "Matchmaking Service" cmd /k "cd services\matchmaking-service && npm run dev"
timeout /t 2 /nobreak >nul

start "Game Service" cmd /k "cd services\game-service && npm run dev"
timeout /t 2 /nobreak >nul

start "Notification Service" cmd /k "cd services\notification-service && npm run dev"
timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo 🌐 Access the game:
echo    Frontend: http://localhost:3000
echo    API: http://localhost:80
echo.
echo 📊 Service Status:
echo    Auth Service: http://localhost:3001/health
echo    User Service: http://localhost:3002/health
echo    Deck Service: http://localhost:3003/health
echo    Matchmaking Service: http://localhost:3004/health
echo    Game Service: http://localhost:3005/health
echo    Notification Service: http://localhost:3006/health
echo.
echo 🎯 Game is ready to play!
echo.
echo Press any key to open the game in your browser...
pause >nul

REM Open game in browser
start http://localhost:3000

echo.
echo 🎮 Game opened in browser!
echo.
echo To stop all services, close all the opened terminal windows.
echo.
pause
