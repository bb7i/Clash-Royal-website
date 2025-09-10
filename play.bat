@echo off
title ClashRoyale.Web - Game Launcher
color 0A

echo.
echo  ██████╗██╗      █████╗ ███████╗██╗  ██╗    ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ███████╗
echo ██╔════╝██║     ██╔══██╗██╔════╝██║  ██╗   ██╔═══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ██╔════╝
echo ██║     ██║     ███████║███████╗███████║   ██║   ██║ ╚████╔╝ ███████║██║     ██║     █████╗  
echo ██║     ██║     ██╔══██║╚════██║██╔══██║   ██║   ██║  ╚██╔╝  ██╔══██║██║     ██║     ██╔══╝  
echo ╚██████╗███████╗██║  ██║███████║██║  ██║   ╚██████╔╝   ██║   ██║  ██║███████╗███████╗███████╗
echo  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
echo.
echo                           🎮 Web-based Clash Royale Game 🎮
echo.
echo ================================================================================
echo.

REM Check if Node.js is installed
echo [1/6] 🔍 Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart this script.
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if Docker is installed
echo.
echo [2/6] 🔍 Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found!
    echo.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo Then restart this script.
    echo.
    pause
    exit /b 1
)
echo ✅ Docker found

REM Start Docker services
echo.
echo [3/6] 🐳 Starting database...
docker-compose -f docker-compose.dev.yml up -d >nul 2>&1
echo ✅ Database started

REM Wait for services
echo.
echo [4/6] ⏳ Preparing services...
timeout /t 10 /nobreak >nul

REM Install dependencies if needed
echo.
echo [5/6] 📦 Installing dependencies...

if not exist "services\auth-service\node_modules" (
    echo    Installing auth-service...
    cd services\auth-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "services\user-service\node_modules" (
    echo    Installing user-service...
    cd services\user-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "services\deck-service\node_modules" (
    echo    Installing deck-service...
    cd services\deck-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "services\matchmaking-service\node_modules" (
    echo    Installing matchmaking-service...
    cd services\matchmaking-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "services\game-service\node_modules" (
    echo    Installing game-service...
    cd services\game-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "services\notification-service\node_modules" (
    echo    Installing notification-service...
    cd services\notification-service
    npm install --silent >nul 2>&1
    cd ..\..
)

if not exist "frontend\node_modules" (
    echo    Installing frontend...
    cd frontend
    npm install --silent >nul 2>&1
    cd ..
)

echo ✅ Dependencies ready

REM Start all services
echo.
echo [6/6] 🎮 Starting game services...

start "Auth Service" cmd /k "cd services\auth-service && npm run dev"
timeout /t 1 /nobreak >nul

start "User Service" cmd /k "cd services\user-service && npm run dev"
timeout /t 1 /nobreak >nul

start "Deck Service" cmd /k "cd services\deck-service && npm run dev"
timeout /t 1 /nobreak >nul

start "Matchmaking Service" cmd /k "cd services\matchmaking-service && npm run dev"
timeout /t 1 /nobreak >nul

start "Game Service" cmd /k "cd services\game-service && npm run dev"
timeout /t 1 /nobreak >nul

start "Notification Service" cmd /k "cd services\notification-service && npm run dev"
timeout /t 1 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ All services started!

echo.
echo ================================================================================
echo.
echo 🎯 GAME IS READY TO PLAY!
echo.
echo 🌐 Opening game in browser...
echo.
echo 📊 Service URLs:
echo    🎮 Game: http://localhost:3000
echo    🔐 Auth: http://localhost:3001/health
echo    👤 User: http://localhost:3002/health
echo    🃏 Deck: http://localhost:3003/health
echo    ⚔️  Match: http://localhost:3004/health
echo    🎲 Game: http://localhost:3005/health
echo    📢 Notify: http://localhost:3006/health
echo.
echo ================================================================================
echo.

REM Wait a moment for services to start
timeout /t 5 /nobreak >nul

REM Open game in browser
start http://localhost:3000

echo 🎮 Game opened in your browser!
echo.
echo 💡 To stop all services, close all the opened terminal windows.
echo.
echo Press any key to exit this launcher...
pause >nul

echo.
echo 🎮 Thanks for playing ClashRoyale.Web!
echo.
timeout /t 2 /nobreak >nul
