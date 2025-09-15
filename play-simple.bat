@echo off
title ClashRoyale.Web - Simple Launcher
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
echo [1/3] 🔍 Checking Node.js...
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
echo [2/3] ⏳ Starting services (no Docker)...

echo Starting Game Service (root src)...
start "Game Service" cmd /k "npm run dev"
timeout /t 1 /nobreak >nul

echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && npm run dev"
timeout /t 1 /nobreak >nul

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
