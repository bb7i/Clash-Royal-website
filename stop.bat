@echo off
title ClashRoyale.Web - Stop All Services
color 0C

echo.
echo  ██████╗██╗      █████╗ ███████╗██╗  ██╗    ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ███████╗
echo ██╔════╝██║     ██╔══██╗██╔════╝██║  ██╗   ██╔═══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ██╔════╝
echo ██║     ██║     ███████║███████╗███████║   ██║   ██║ ╚████╔╝ ███████║██║     ██║     █████╗  
echo ██║     ██║     ██╔══██║╚════██║██╔══██║   ██║   ██║  ╚██╔╝  ██╔══██║██║     ██║     ██╔══╝  
echo ╚██████╗███████╗██║  ██║███████║██║  ██║   ╚██████╔╝   ██║   ██║  ██║███████╗███████╗███████╗
echo  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
echo.
echo                           🛑 Stopping All Services 🛑
echo.
echo ================================================================================
echo.

echo 🛑 Stopping all game services...

REM Stop Docker services
echo.
echo 🐳 Stopping database...
docker-compose -f docker-compose.dev.yml down

REM Kill all Node.js processes
echo.
echo 🔄 Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1

REM Kill all npm processes
echo.
echo 📦 Stopping npm processes...
taskkill /f /im npm.cmd >nul 2>&1

REM Kill all nodemon processes
echo.
echo 🔄 Stopping nodemon processes...
taskkill /f /im nodemon.cmd >nul 2>&1

echo.
echo ✅ All services stopped!
echo.
echo 🎮 Thanks for playing ClashRoyale.Web!
echo.
echo Press any key to exit...
pause >nul
