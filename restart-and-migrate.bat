@echo off
echo ========================================
echo Restarting app to apply database migration
echo ========================================
echo.

echo Stopping all processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

echo.
echo Waiting for processes to close...
timeout /t 2 >nul

echo.
echo Starting the app...
echo The database migration will run automatically.
echo.
start "" npm run electron

echo.
echo ========================================
echo App is starting...
echo The migration will run in the background.
echo Check the console for migration messages.
echo ========================================
pause
