@echo off
title ClashRoyale.Web - Service Status
color 0B

echo.
echo  ██████╗██╗      █████╗ ███████╗██╗  ██╗    ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ███████╗
echo ██╔════╝██║     ██╔══██╗██╔════╝██║  ██╗   ██╔═══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ██╔════╝
echo ██║     ██║     ███████║███████╗███████║   ██║   ██║ ╚████╔╝ ███████║██║     ██║     █████╗  
echo ██║     ██║     ██╔══██║╚════██║██╔══██║   ██║   ██║  ╚██╔╝  ██╔══██║██║     ██║     ██╔══╝  
echo ╚██████╗███████╗██║  ██║███████║██║  ██║   ╚██████╔╝   ██║   ██║  ██║███████╗███████╗███████╗
echo  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
echo.
echo                           📊 Service Status Check 📊
echo.
echo ================================================================================
echo.

echo 🔍 Checking services...

REM Check if services are running
set "allRunning=true"

echo.
echo 📊 Service Status:
echo.

REM Check Frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend (3000) - Running
) else (
    echo ❌ Frontend (3000) - Not running
    set "allRunning=false"
)

REM Check Auth Service
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Auth Service (3001) - Running
) else (
    echo ❌ Auth Service (3001) - Not running
    set "allRunning=false"
)

REM Check User Service
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ User Service (3002) - Running
) else (
    echo ❌ User Service (3002) - Not running
    set "allRunning=false"
)

REM Check Deck Service
curl -s http://localhost:3003/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Deck Service (3003) - Running
) else (
    echo ❌ Deck Service (3003) - Not running
    set "allRunning=false"
)

REM Check Matchmaking Service
curl -s http://localhost:3004/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Matchmaking Service (3004) - Running
) else (
    echo ❌ Matchmaking Service (3004) - Not running
    set "allRunning=false"
)

REM Check Game Service
curl -s http://localhost:3005/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Game Service (3005) - Running
) else (
    echo ❌ Game Service (3005) - Not running
    set "allRunning=false"
)

REM Check Notification Service
curl -s http://localhost:3006/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Notification Service (3006) - Running
) else (
    echo ❌ Notification Service (3006) - Not running
    set "allRunning=false"
)

echo.
echo ================================================================================
echo.

if "%allRunning%"=="true" (
    echo 🎯 All services are running!
    echo.
    echo 🌐 Game URL: http://localhost:3000
    echo.
    echo Press any key to open the game...
    pause >nul
    start http://localhost:3000
) else (
    echo ❌ Some services are not running.
    echo.
    echo 💡 Try running: play.bat
    echo.
    echo Press any key to exit...
    pause >nul
)

echo.
echo 🎮 ClashRoyale.Web Status Check Complete!
echo.
timeout /t 2 /nobreak >nul
