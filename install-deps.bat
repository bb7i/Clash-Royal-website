@echo off
title ClashRoyale.Web - Install Dependencies
color 0B

echo.
echo  ██████╗██╗      █████╗ ███████╗██╗  ██╗    ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ███████╗
echo ██╔════╝██║     ██╔══██╗██╔════╝██║  ██╗   ██╔═══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ██╔════╝
echo ██║     ██║     ███████║███████╗███████║   ██║   ██║ ╚████╔╝ ███████║██║     ██║     █████╗  
echo ██║     ██║     ██╔══██║╚════██║██╔══██║   ██║   ██║  ╚██╔╝  ██╔══██║██║     ██║     ██╔══╝  
echo ╚██████╗███████╗██║  ██║███████║██║  ██║   ╚██████╔╝   ██║   ██║  ██║███████╗███████╗███████╗
echo  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
echo.
echo                           📦 Installing Dependencies 📦
echo.
echo ================================================================================
echo.

REM Check if Node.js is installed
echo 🔍 Checking Node.js...
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

REM Install dependencies for all services
echo.
echo 📦 Installing dependencies for all services...

echo.
echo Installing auth-service...
cd services\auth-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install auth-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing user-service...
cd services\user-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install user-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing deck-service...
cd services\deck-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install deck-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing matchmaking-service...
cd services\matchmaking-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install matchmaking-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing game-service...
cd services\game-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install game-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing notification-service...
cd services\notification-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install notification-service dependencies!
    pause
    exit /b 1
)
cd ..\..

echo.
echo Installing frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies!
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.
echo 🎮 Now you can run: play-simple.bat
echo.
echo Press any key to exit...
pause >nul
