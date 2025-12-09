# Inventory Management System - Setup Instructions

## Overview
This is a complete Inventory Management System built with Electron.js, Next.js, Supabase (for authentication), and SQLite (for local database).

## Features
- User authentication with Supabase
- Category management (name + code)
- Sub-category management (linked to categories)
- Brand management (name + code)
- Product entry with:
  - Barcode for item
  - Barcode for box
  - Category dropdown (populated from SQLite)
  - Sub-category dropdown (filtered by selected category)
  - Brand dropdown (populated from SQLite)
  - Product image upload
- Full CRUD operations for all entities
- SQLite database for local data storage

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier works)

## Setup Instructions

### 1. Supabase Configuration
Your Supabase credentials are already configured in `.env.local`:
- URL: https://fkyefdebtvpjehuflrkt.supabase.co
- The authentication is ready to use

### 2. Create a User in Supabase Authentication

**Important:** This application uses **Supabase Authentication** for login, while all inventory data (categories, brands, products) is stored in **SQLite locally**.

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Users** in the left sidebar
4. Click **"Add User"** button
5. Choose **"Create new user"**
6. Enter:
   - **Email**: `admin@example.com` (or your preferred email)
   - **Password**: `password123` (or your preferred password)
7. Click **"Create User"**
8. Use these credentials to log in to the application

### 3. Install Dependencies
All dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### 4. Run the Application in Development Mode
```bash
npm run electron
```

This command will:
- Start the Next.js development server on port 3000
- Wait for the server to be ready
- Launch the Electron application

### 5. Build for Production
```bash
npm run electron:build
```

This will create a production build in the `dist` folder.

## Application Structure

```
my-app/
├── electron/
│   ├── main.js          # Electron main process with SQLite handlers
│   └── preload.js       # IPC communication bridge
├── app/
│   ├── page.js          # Login page with Supabase auth
│   └── dashboard/
│       └── page.js      # Main dashboard with tabs
├── components/
│   ├── Category.js      # Category management component
│   ├── SubCategory.js   # Sub-category management component
│   ├── Brand.js         # Brand management component
│   └── ProductEntry.js  # Product entry form with all fields
├── lib/
│   └── supabase.js      # Supabase client configuration
└── .env.local           # Environment variables (Supabase config)
```

## Database Schema

### Categories Table
- id (PRIMARY KEY)
- category_name (TEXT)
- category_code (TEXT, UNIQUE)
- created_at (DATETIME)

### Sub-Categories Table
- id (PRIMARY KEY)
- category_id (FOREIGN KEY)
- sub_category_name (TEXT)
- sub_category_code (TEXT, UNIQUE)
- created_at (DATETIME)

### Brands Table
- id (PRIMARY KEY)
- brand_name (TEXT)
- brand_code (TEXT, UNIQUE)
- created_at (DATETIME)

### Products Table
- id (PRIMARY KEY)
- barcode_item (TEXT, UNIQUE)
- barcode_box (TEXT)
- category_id (FOREIGN KEY)
- sub_category_id (FOREIGN KEY)
- brand_id (FOREIGN KEY)
- image_path (TEXT)
- created_at (DATETIME)

## Usage

### Login
1. Launch the application
2. Enter your Supabase user credentials
3. Click "Sign In"

### Managing Categories
1. Navigate to the "Category" tab
2. Enter category name and code
3. Click "Add Category"
4. Edit or delete existing categories from the table

### Managing Sub-Categories
1. Navigate to the "Sub-Category" tab
2. Select a parent category from the dropdown
3. Enter sub-category name and code
4. Click "Add Sub-Category"

### Managing Brands
1. Navigate to the "Brand" tab
2. Enter brand name and code
3. Click "Add Brand"

### Adding Products
1. Navigate to the "Product Entry" tab
2. Enter barcode for item (required)
3. Enter barcode for box (optional)
4. Select category from dropdown
5. Select sub-category (filtered based on category)
6. Select brand from dropdown
7. Upload product image (optional)
8. Click "Add Product"

## Database Location
The SQLite database is stored in your user data directory:
- Windows: `%APPDATA%/my-app/inventory.db`
- macOS: `~/Library/Application Support/my-app/inventory.db`
- Linux: `~/.config/my-app/inventory.db`

## Troubleshooting

### Issue: Dropdowns are empty
- Make sure you've added categories, sub-categories, and brands first
- The data is stored locally in SQLite, so it persists across sessions

### Issue: Sub-category dropdown is disabled
- You must select a category first
- Sub-categories are filtered based on the selected category

### Issue: Login fails
- Verify your Supabase credentials in `.env.local`
- Make sure you've created a user in the Supabase dashboard
- Check your internet connection (Supabase auth requires internet)

### Issue: Electron window doesn't open
- Make sure port 3000 is not in use
- Check the console for any errors
- Try running `npm run dev` first to ensure Next.js works

## Development Notes

### IPC Communication
The application uses Electron's IPC (Inter-Process Communication) to communicate between the renderer (Next.js) and main process (Electron):
- All database operations are handled in `electron/main.js`
- The `preload.js` exposes safe APIs to the renderer
- Access APIs via `window.electronAPI` in React components

### Security
- Context isolation is enabled
- Node integration is disabled in renderer
- Only whitelisted APIs are exposed through preload script

## Next Steps
1. Add data validation and error handling
2. Implement search and filter functionality
3. Add export/import features (CSV, Excel)
4. Add reporting and analytics
5. Implement barcode scanning with hardware scanner
6. Add inventory stock management
7. Implement user roles and permissions

## Support
For issues or questions, please check:
- Electron documentation: https://www.electronjs.org/docs
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- better-sqlite3 documentation: https://github.com/WiseLibs/better-sqlite3
