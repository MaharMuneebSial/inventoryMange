@echo off
echo ========================================
echo   Inventory Management System
echo   Starting Application...
echo ========================================
echo.

REM Clean up any previous lock files
echo Cleaning up lock files...
if exist ".next\dev\lock" del /F /Q ".next\dev\lock" 2>nul
if exist ".next\dev" rd /s /q ".next\dev" 2>nul

echo.
echo Starting Electron application...
echo.
echo Please wait for:
echo 1. Next.js dev server to start
echo 2. Electron window to open
echo.
echo This may take 30-60 seconds...
echo.
echo NOTE: If you see errors, try running kill-processes.bat first
echo.

npm run electron

echo.
echo Application closed.
pause
