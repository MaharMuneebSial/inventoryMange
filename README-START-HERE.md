# Inventory Management System - START HERE

## 🚀 Quick Start (3 Steps)

### 1️⃣ Create Supabase User
- Go to: https://app.supabase.com
- Navigate to: **Authentication → Users**
- Click: **"Add User"**
- Create user with email and password

### 2️⃣ Clean Previous Instances (if any)
- Double-click: `kill-processes.bat`

### 3️⃣ Start the Application
- Double-click: `start-app.bat`
- Wait 30-60 seconds for the app to open
- Login with your Supabase credentials

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast setup and usage guide
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup instructions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Fix common issues
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical details

## 🛠️ Helpful Files

- `start-app.bat` - Launch the application
- `kill-processes.bat` - Stop all running instances
- `.env.local` - Supabase configuration (already set up)

## ⚙️ What This App Does

### Authentication
- ✅ Login with Supabase (cloud)
- ✅ Secure session management

### Inventory Management (All stored locally in SQLite)
- ✅ **Categories** - Manage product categories (name + code)
- ✅ **Sub-Categories** - Manage sub-categories (linked to categories)
- ✅ **Brands** - Manage brands (name + code)
- ✅ **Products** - Full product management with:
  - Item barcode
  - Box barcode
  - Category selection
  - Sub-category selection (filtered by category)
  - Brand selection
  - Product image upload

## 🔧 Common Issues

### "Unable to acquire lock" error?
→ Run `kill-processes.bat`

### Port 3000 already in use?
→ Run `kill-processes.bat`

### Electron window not opening?
→ Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Dropdowns are empty?
→ Add categories, sub-categories, and brands first

## 💡 Tips

1. **First time running?**
   - Add at least one category
   - Add at least one sub-category
   - Add at least one brand
   - Then you can add products

2. **Sub-category dropdown disabled?**
   - Select a category first
   - Sub-categories are filtered by selected category

3. **Debugging?**
   - Press F12 in Electron window to open DevTools
   - Check console for errors

## 📁 Project Structure

```
my-app/
├── start-app.bat              # 👈 Start here!
├── kill-processes.bat         # Stop running instances
├── electron/                  # Electron main process
│   ├── main.js               # SQLite database handlers
│   └── preload.js            # IPC bridge
├── app/
│   ├── page.js               # Login page (Supabase)
│   └── dashboard/page.js     # Main dashboard
├── components/
│   ├── Category.js           # Category management
│   ├── SubCategory.js        # Sub-category management
│   ├── Brand.js              # Brand management
│   └── ProductEntry.js       # Product entry form
└── lib/
    └── supabase.js           # Supabase client
```

## 🎯 Usage Flow

```
1. Login (Supabase) → Dashboard
2. Add Categories
3. Add Sub-Categories (select category first)
4. Add Brands
5. Add Products (all dropdowns now populated)
```

## 🗄️ Data Storage

- **Login data:** Supabase (cloud)
- **Inventory data:** SQLite (local)
  - Location: `%APPDATA%\my-app\inventory.db`

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Check [QUICK_START.md](QUICK_START.md) for detailed usage
3. Look at console errors (F12 in Electron window)

## 🚨 Before You Start

Make sure you have:
- ✅ Created a user in Supabase Authentication
- ✅ Closed any previous instances (run `kill-processes.bat`)
- ✅ Your Supabase credentials are in `.env.local` (already configured)

## 🎉 Ready to Go!

Double-click `start-app.bat` and start managing your inventory!
