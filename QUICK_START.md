# Quick Start Guide

## Setup (First Time Only)

### Step 1: Create Supabase User
1. Open https://app.supabase.com
2. Go to your project (already configured: `fkyefdebtvpjehuflrkt`)
3. Click **Authentication** → **Users** in sidebar
4. Click **"Add User"** button
5. Enter:
   - Email: `admin@example.com`
   - Password: `password123`
6. Click **"Create User"**

### Step 2: Clean Up (If you've run the app before)
Double-click `kill-processes.bat` to stop any running instances.

### Step 3: Run the Application

**Option A: Use the batch file (Recommended)**
Double-click `start-app.bat` in the project folder

**Option B: Use command line**
```bash
npm run electron
```

**Option C: Run in separate terminals (for debugging)**
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Wait for server to start, then run Electron
npm run electron:dev
```

### Step 3: Login
- Email: `admin@example.com`
- Password: `password123`

## Using the Application

### 1. Add Categories
- Go to **Category** tab
- Enter category name and code
- Click "Add Category"

**Example:**
- Name: `Electronics`
- Code: `ELEC001`

### 2. Add Sub-Categories
- Go to **Sub-Category** tab
- Select a category from dropdown
- Enter sub-category name and code
- Click "Add Sub-Category"

**Example:**
- Category: `Electronics`
- Name: `Mobile Phones`
- Code: `MOB001`

### 3. Add Brands
- Go to **Brand** tab
- Enter brand name and code
- Click "Add Brand"

**Example:**
- Name: `Samsung`
- Code: `SAM001`

### 4. Add Products
- Go to **Product Entry** tab
- Fill in all fields:
  - **Barcode for Item**: Unique item barcode (required)
  - **Barcode for Box**: Box barcode (optional)
  - **Category**: Select from dropdown
  - **Sub-Category**: Select from dropdown (filtered by category)
  - **Brand**: Select from dropdown
  - **Image**: Upload product image (optional)
- Click "Add Product"

**Example:**
- Barcode Item: `123456789012`
- Barcode Box: `987654321098`
- Category: `Electronics`
- Sub-Category: `Mobile Phones`
- Brand: `Samsung`
- Image: Upload phone image

## Tips

### Dropdowns Are Empty?
Make sure you've added:
1. At least one category (for sub-category and product entry)
2. At least one sub-category (for product entry)
3. At least one brand (for product entry)

### Sub-Category Dropdown Disabled?
- Select a category first
- Sub-categories are filtered based on selected category

### Edit/Delete Items
- Click "Edit" button in the table row
- Modify fields and click "Update"
- Click "Delete" to remove (with confirmation)

### Logout
- Click "Logout" button in top-right corner
- Returns to login page

## Data Storage

**Login Data:** Stored in Supabase (cloud)
**Inventory Data:** Stored locally in SQLite

Your database location:
- Windows: `C:\Users\YourName\AppData\Roaming\my-app\inventory.db`
- macOS: `~/Library/Application Support/my-app/inventory.db`
- Linux: `~/.config/my-app/inventory.db`

## Common Commands

```bash
# Run in development mode
npm run electron

# Build for production
npm run electron:build

# Run Next.js dev server only (for testing)
npm run dev
```

## Troubleshooting

### "Invalid email or password"
- Verify user exists in Supabase Authentication
- Check email/password are correct
- Ensure Supabase credentials in `.env.local` are correct

### Electron window doesn't open
- Check if port 3000 is available
- Look for errors in console
- Try running `npm run dev` first to test Next.js

### Dropdowns not loading data
- Open Developer Tools (F12 in Electron)
- Check for errors in console
- Verify SQLite database was created

### Data disappeared
- Check if you're using the same user data directory
- SQLite database is created fresh on first run
- Each Electron installation has its own database

## Need Help?

See detailed documentation:
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Full setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [README.md](README.md) - Project overview
