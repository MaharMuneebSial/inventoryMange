@echo off
echo Stopping all processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

echo Deleting old database...
del /F /Q "%APPDATA%\my-app\inventory.db" >nul 2>&1

echo Cleaning lock files...
del /F /Q ".next\dev\lock" >nul 2>&1

echo Database reset complete!
echo.
echo Starting the app...
npm run electron
