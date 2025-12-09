@echo off
echo Killing all Node.js and Electron processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul
echo.
echo Cleaning lock files...
del /F /Q ".next\dev\lock" 2>nul
del /F /Q ".next\dev\*" 2>nul
echo.
echo Done! You can now run the application.
pause
