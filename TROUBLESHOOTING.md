# Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Unable to acquire lock" Error

**Error Message:**
```
⨯ Unable to acquire lock at .next\dev\lock, is another instance of next dev running?
```

**Solution:**

#### Option A: Use the kill-processes.bat file
1. Double-click `kill-processes.bat` in the project folder
2. Wait for it to complete
3. Run the application again

#### Option B: Manual cleanup
1. Close all terminal/command prompt windows
2. Open Task Manager (Ctrl + Shift + Esc)
3. Find and end all `node.exe` processes
4. Delete the lock file:
   ```
   del /F /Q ".next\dev\lock"
   ```
5. Try running the app again

### Issue 2: Port 3000 Already in Use

**Error Message:**
```
⚠ Port 3000 is in use by process XXXX
```

**Solution:**

#### Option A: Kill the process using the port
```bash
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /F /PID <PID>
```

#### Option B: Use a different port
Edit `package.json`:
```json
"dev": "next dev -p 3001"
```

Then update `electron/main.js` line 70:
```javascript
mainWindow.loadURL('http://localhost:3001');
```

### Issue 3: Electron Window Not Opening

**Symptoms:**
- Terminal shows dev server is running
- No Electron window appears

**Solution:**

1. Make sure both commands complete:
   - `npm run dev` (Next.js server)
   - `electron .` (Electron app)

2. Try running them separately:
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2 (wait for server to start)
   npm run electron:dev
   ```

3. Check for errors in the console

### Issue 4: "Cannot read properties of undefined (reading 'whenReady')"

**Cause:** Electron module not loading properly

**Solution:**

1. Reinstall Electron:
   ```bash
   npm uninstall electron
   npm install --save-dev electron
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

3. Make sure `package.json` has:
   ```json
   "main": "electron/main.js"
   ```

### Issue 5: Database Not Working / Dropdowns Empty

**Symptoms:**
- Categories, Brands not showing in dropdowns
- Data not saving

**Solution:**

1. Check if `electronAPI` is available:
   - Open DevTools in Electron (F12)
   - In console, type: `window.electronAPI`
   - Should show an object with methods

2. Check database location:
   - Windows: `%APPDATA%\my-app\inventory.db`
   - Verify file exists and has size > 0

3. Check console for errors related to SQLite

### Issue 6: Login Not Working

**Symptoms:**
- "Invalid email or password" error
- Can't login with credentials

**Solution:**

1. Verify user exists in Supabase:
   - Go to https://app.supabase.com
   - Authentication → Users
   - Check if user exists

2. Verify Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```

3. Check browser console for Supabase errors

4. Try creating a new user in Supabase Dashboard

### Issue 7: "Module not found" Errors

**Solution:**

1. Delete `node_modules` and reinstall:
   ```bash
   rd /s /q node_modules
   del package-lock.json
   npm install
   ```

2. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

## Step-by-Step: Clean Start

If nothing else works, try this clean start procedure:

1. **Kill all processes:**
   ```bash
   # Run kill-processes.bat OR
   taskkill /F /IM node.exe /T
   taskkill /F /IM electron.exe /T
   ```

2. **Clean build artifacts:**
   ```bash
   rd /s /q .next
   rd /s /q node_modules
   del package-lock.json
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install
   ```

4. **Start the application:**
   ```bash
   npm run electron
   ```

## Getting Help

If you're still experiencing issues:

1. Check the console output for error messages
2. Open DevTools (F12) in the Electron window
3. Look for errors in both the terminal and browser console
4. Make sure you've completed all setup steps in SETUP_INSTRUCTIONS.md

## Quick Commands Reference

```bash
# Clean and restart
npm run clean
npm run electron

# Run in separate terminals
npm run dev          # Terminal 1
npm run electron:dev # Terminal 2

# Kill all processes
# Use kill-processes.bat file

# Check what's running on port 3000
netstat -ano | findstr :3000

# View database location
echo %APPDATA%\my-app\inventory.db
```

## Development Tips

1. **Use two terminals for debugging:**
   - Terminal 1: `npm run dev`
   - Terminal 2: `npm run electron:dev`
   - This gives you better control and error visibility

2. **Check DevTools:**
   - Electron opens with DevTools automatically in development
   - Watch for errors in Console tab
   - Check Network tab for failed requests

3. **Database location:**
   - Find your SQLite database at:
     `C:\Users\YourName\AppData\Roaming\my-app\inventory.db`
   - You can open it with DB Browser for SQLite to inspect data

4. **Port conflicts:**
   - If you often have port conflicts, consider using a different default port
   - Edit package.json: `"dev": "next dev -p 3001"`
