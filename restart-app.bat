@echo off
echo Stopping all processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

echo Waiting for processes to close...
timeout /t 2 >nul

echo Cleaning lock files...
del /F /Q ".next\dev\lock" >nul 2>&1

echo.
echo Starting the app...
npm run electron
