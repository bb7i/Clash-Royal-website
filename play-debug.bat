@echo off
title ClashRoyale.Web - Debug Launcher
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
echo [2/4] ⏳ Preparing environment (no Docker)...
echo    Ensure PostgreSQL and Redis are running locally.
echo    Example DB URL: postgresql://clashroyale:clashroyale123@localhost:5432/clashroyale
echo    Example Redis URL: redis://localhost:6379
timeout /t 3 /nobreak >nul

REM Install dependencies if needed
echo.
echo [3/4] 📦 Installing dependencies...

echo Checking auth-service...
echo Checking notification-service...
if not exist "notification-service\node_modules" (
    echo    Installing notification-service...
    cd notification-service
    echo    Running: npm install
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install notification-service dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo    ✅ Notification-service installed
) else (
    echo    ✅ Notification-service already installed
)

echo Checking frontend...
if not exist "frontend\node_modules" (
    echo    Installing frontend...
    cd frontend
    echo    Running: npm install
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo    ✅ Frontend installed
) else (
    echo    ✅ Frontend already installed
)

echo ✅ Dependencies ready

REM Start all services
echo.
echo [4/4] 🎮 Starting services (no Docker)...

echo Starting Game Service...
start "Game Service" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Frontend...
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
echo    🎮 Frontend: http://localhost:3000
echo    🎲 Game Service: http://localhost:3005/health
echo    📢 Notification Service: http://localhost:3006/health
echo.
echo ================================================================================
echo.

REM Wait a moment for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Open game in browser
echo Opening game in browser...
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
