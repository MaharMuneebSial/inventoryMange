# Application Architecture

## Overview
This inventory management system uses a **hybrid architecture**:
- **Supabase Authentication** for user login/logout
- **SQLite** for all inventory data storage (local database)

## Authentication Flow

### Login (Supabase Auth)
1. User enters email and password on login page
2. Credentials are verified against Supabase Authentication
3. On success, Supabase creates a session
4. User is redirected to dashboard

### How to Create Users
Go to Supabase Dashboard:
1. Navigate to **Authentication** → **Users**
2. Click **"Add User"**
3. Enter email and password
4. Click **"Create User"**

## Data Storage

### Supabase (Cloud)
**Purpose:** User authentication only
- Login/logout functionality
- Session management
- User credentials

**NOT stored in Supabase:**
- Categories
- Sub-categories
- Brands
- Products
- Product images

### SQLite (Local)
**Purpose:** All inventory data
**Location:** User's local machine
- Windows: `%APPDATA%/my-app/inventory.db`
- macOS: `~/Library/Application Support/my-app/inventory.db`
- Linux: `~/.config/my-app/inventory.db`

**Tables:**
1. **categories**
   - id, category_name, category_code, created_at

2. **sub_categories**
   - id, category_id, sub_category_name, sub_category_code, created_at

3. **brands**
   - id, brand_name, brand_code, created_at

4. **products**
   - id, barcode_item, barcode_box, category_id, sub_category_id, brand_id, image_path, created_at

## Component Structure

```
Login Page (app/page.js)
    ↓ [Supabase Auth]
    ↓
Dashboard (app/dashboard/page.js)
    ↓
    ├── Category Component → SQLite
    ├── Sub-Category Component → SQLite
    ├── Brand Component → SQLite
    └── Product Entry Component → SQLite
```

## IPC Communication (Electron)

All SQLite operations use Electron's IPC:
```
React Component
    ↓ (window.electronAPI.*)
Preload Script (electron/preload.js)
    ↓ (ipcRenderer.invoke)
Main Process (electron/main.js)
    ↓ (better-sqlite3)
SQLite Database
```

## Security Features

1. **Context Isolation**: Enabled in Electron
2. **Node Integration**: Disabled in renderer
3. **Preload Script**: Only whitelisted APIs exposed
4. **Supabase**: Secure authentication with JWT tokens
5. **SQLite**: Local database, no network exposure

## Data Flow Examples

### Adding a Category
1. User fills category form
2. React component calls `window.electronAPI.addCategory(data)`
3. Preload script forwards to main process
4. Main process inserts into SQLite
5. Returns success/error to component
6. Component reloads category list

### User Login
1. User enters credentials
2. React component calls `supabase.auth.signInWithPassword()`
3. Supabase validates and creates session
4. Session stored in browser
5. User redirected to dashboard

## Why This Architecture?

**Advantages:**
- ✅ Secure cloud-based authentication
- ✅ Fast local data access (no API calls)
- ✅ Works offline (after login)
- ✅ No database hosting costs for inventory data
- ✅ Data privacy (inventory stays on user's machine)
- ✅ No latency for CRUD operations

**Trade-offs:**
- ⚠️ Inventory data not synced across devices
- ⚠️ Requires Electron (desktop app)
- ⚠️ Each installation has separate database

## Future Enhancements

Possible improvements:
1. Add encryption for SQLite database
2. Implement data backup/restore
3. Add export to cloud storage
4. Multi-user support with role-based access
5. Sync between devices using Supabase
6. Add product barcode scanner integration
