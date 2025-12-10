const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

let mainWindow;
let db;
let SQL;

async function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'inventory.db');

  // Initialize SQL.js
  SQL = await initSqlJs();

  // Load existing database or create new one
  let buffer;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Add custom run() method to database for parameterized queries
  if (!db.run) {
    db.run = function(sql, params = []) {
      try {
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
          stmt.bind(params);
        }
        stmt.step();
        stmt.free();
      } catch (error) {
        console.error('db.run error:', error);
        throw error;
      }
    };
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      category_code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sub_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      sub_category_name TEXT NOT NULL,
      sub_category_code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_name TEXT NOT NULL,
      brand_code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_name TEXT NOT NULL,
      unit_code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      barcode_item TEXT NOT NULL UNIQUE,
      barcode_box TEXT,
      category_id INTEGER NOT NULL,
      sub_category_id INTEGER NOT NULL,
      brand_id INTEGER NOT NULL,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_name TEXT NOT NULL,
      supplier_code TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL,
      whatsapp_number TEXT,
      address TEXT,
      email TEXT,
      type_of_item TEXT,
      jazzcash_easypaisa TEXT,
      bank_account_number TEXT,
      bank_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      item_barcode TEXT,
      box_barcode TEXT,
      category_id INTEGER,
      sub_category_id INTEGER,
      brand_id INTEGER,
      supplier_id INTEGER,
      mfg_date TEXT,
      exp_date TEXT,
      purchase_date TEXT,
      quantity REAL,
      unit TEXT,
      purchase_price REAL,
      sale_price REAL,
      carton REAL DEFAULT 0,
      box REAL DEFAULT 0,
      packet REAL DEFAULT 0,
      min_wholesale_qty REAL DEFAULT 0,
      wholesale_price REAL DEFAULT 0,
      unit_type TEXT,
      pack_qty REAL DEFAULT 0,
      carton_qty REAL DEFAULT 0,
      gst REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      packaging_type TEXT,
      num_cartons REAL DEFAULT 0,
      boxes_per_carton REAL DEFAULT 0,
      pieces_per_box REAL DEFAULT 0,
      num_boxes REAL DEFAULT 0,
      num_packs REAL DEFAULT 0,
      pieces_per_pack REAL DEFAULT 0,
      extra_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id TEXT NOT NULL UNIQUE,
      sale_date TEXT NOT NULL,
      sale_time TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      amount_received REAL NOT NULL,
      change_due REAL DEFAULT 0,
      sold_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      rate_per_unit REAL NOT NULL,
      line_total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sale_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id TEXT NOT NULL UNIQUE,
      original_sale_id TEXT NOT NULL,
      return_quantity REAL NOT NULL,
      refund_amount REAL NOT NULL,
      reason TEXT,
      refund_method TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_sale_id) REFERENCES sales(sale_id)
    );
  `);

  // Note: purchase_returns and supplier_credits tables are created later in migration section

  // Run migration to add product_name column if it doesn't exist
  try {
    // Check if product_name column exists by trying to select it
    try {
      db.exec(`SELECT product_name FROM products LIMIT 1`);
      console.log('product_name column already exists');
    } catch (columnError) {
      // Column doesn't exist, add it
      console.log('Adding product_name column to products table...');
      db.run(`ALTER TABLE products ADD COLUMN product_name TEXT`);
      console.log('product_name column added successfully');
    }

    // Now update any products that have NULL or empty product_name
    const result = db.exec(`SELECT id FROM products WHERE product_name IS NULL OR product_name = ''`);
    if (result.length > 0 && result[0].values.length > 0) {
      console.log('Migrating products without product names...');
      db.run(`UPDATE products SET product_name = 'Product ' || id WHERE product_name IS NULL OR product_name = ''`);
      console.log('Migration complete: Updated products with missing product names');
    }
  } catch (error) {
    console.log('Migration error:', error.message);
  }

  // Database migrations for existing tables
  try {
    // Get current columns in purchases table
    const tableInfo = db.exec("PRAGMA table_info(purchases)");
    const existingColumns = tableInfo[0]?.values.map(col => col[1]) || [];

    console.log('Existing columns in purchases table:', existingColumns);

    // List of columns that should exist
    const requiredColumns = [
      { name: 'packaging_type', type: 'TEXT', default: null },
      { name: 'num_cartons', type: 'REAL', default: 0 },
      { name: 'boxes_per_carton', type: 'REAL', default: 0 },
      { name: 'pieces_per_box', type: 'REAL', default: 0 },
      { name: 'num_boxes', type: 'REAL', default: 0 },
      { name: 'num_packs', type: 'REAL', default: 0 },
      { name: 'pieces_per_pack', type: 'REAL', default: 0 },
      { name: 'extra_amount', type: 'REAL', default: 0 }
    ];

    // Add missing columns
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col.name)) {
        const defaultValue = col.default === null ? 'NULL' : col.default;
        console.log(`Adding ${col.name} column to purchases table...`);
        db.run(`ALTER TABLE purchases ADD COLUMN ${col.name} ${col.type} DEFAULT ${defaultValue}`);
        console.log(`${col.name} column added successfully`);
      }
    }
  } catch (error) {
    console.log('Migration error (may be safe to ignore):', error.message);
  }

  // Create purchase_returns and supplier_credits tables if not exist
  try {
    console.log('Checking purchase_returns and supplier_credits tables...');

    // Create purchase_returns table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS purchase_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_purchase_id INTEGER NOT NULL,
        return_quantity REAL NOT NULL,
        refund_amount REAL NOT NULL,
        reason TEXT,
        refund_method TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_purchase_id) REFERENCES purchases(id)
      )
    `);
    console.log('✅ purchase_returns table ready');

    // Create supplier_credits table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS supplier_credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        purchase_return_id INTEGER NOT NULL,
        credit_amount REAL NOT NULL,
        remaining_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (purchase_return_id) REFERENCES purchase_returns(id)
      )
    `);
    console.log('✅ supplier_credits table ready');

  } catch (error) {
    console.log('Table creation error:', error.message);
  }

  // Migrate NULL wholesale values in existing purchases
  try {
    console.log('Migrating NULL wholesale values...');
    db.run(`
      UPDATE purchases
      SET wholesale_price = COALESCE(wholesale_price, 0),
          min_wholesale_qty = COALESCE(min_wholesale_qty, 0)
      WHERE wholesale_price IS NULL OR min_wholesale_qty IS NULL
    `);
    console.log('✅ Wholesale migration complete');
  } catch (error) {
    console.log('Wholesale migration error:', error.message);
  }

  // Save database to file
  saveDatabase(dbPath);

  console.log('Database initialized successfully');
}

function saveDatabase(dbPath) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Remove the menu bar completely
  mainWindow.setMenu(null);

  // Always load from dev server in development
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Failed to load, retrying...');
    setTimeout(() => {
      if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
      }
    }, 1000);
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    app.quit();
  }
});

// Helper function to convert sql.js result to array of objects
function resultToArray(result) {
  const rows = [];
  for (let i = 0; i < result[0].values.length; i++) {
    const row = {};
    for (let j = 0; j < result[0].columns.length; j++) {
      row[result[0].columns[j]] = result[0].values[i][j];
    }
    rows.push(row);
  }
  return rows;
}

// IPC Handlers for Categories
ipcMain.handle('add-category', async (event, { categoryName, categoryCode }) => {
  try {
    db.run('INSERT INTO categories (category_name, category_code) VALUES (?, ?)', [categoryName, categoryCode]);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-categories', async () => {
  try {
    const result = db.exec('SELECT * FROM categories ORDER BY created_at DESC');
    const categories = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-category', async (event, { id, categoryName, categoryCode }) => {
  try {
    db.run('UPDATE categories SET category_name = ?, category_code = ? WHERE id = ?', [categoryName, categoryCode, id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-category', async (event, id) => {
  try {
    db.run('DELETE FROM categories WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Sub-Categories
ipcMain.handle('add-sub-category', async (event, { categoryId, subCategoryName, subCategoryCode }) => {
  try {
    db.run('INSERT INTO sub_categories (category_id, sub_category_name, sub_category_code) VALUES (?, ?, ?)', [categoryId, subCategoryName, subCategoryCode]);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sub-categories', async (event, categoryId) => {
  try {
    let result;
    if (categoryId) {
      result = db.exec(`
        SELECT sc.*, c.category_name
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
        WHERE sc.category_id = ?
        ORDER BY sc.created_at DESC
      `, [categoryId]);
    } else {
      result = db.exec(`
        SELECT sc.*, c.category_name
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
        ORDER BY sc.created_at DESC
      `);
    }

    const subCategories = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: subCategories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-sub-category', async (event, { id, categoryId, subCategoryName, subCategoryCode }) => {
  try {
    db.run('UPDATE sub_categories SET category_id = ?, sub_category_name = ?, sub_category_code = ? WHERE id = ?', [categoryId, subCategoryName, subCategoryCode, id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-sub-category', async (event, id) => {
  try {
    db.run('DELETE FROM sub_categories WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Brands
ipcMain.handle('add-brand', async (event, { brandName, brandCode }) => {
  try {
    db.run('INSERT INTO brands (brand_name, brand_code) VALUES (?, ?)', [brandName, brandCode]);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-brands', async () => {
  try {
    const result = db.exec('SELECT * FROM brands ORDER BY created_at DESC');
    const brands = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: brands };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-brand', async (event, { id, brandName, brandCode }) => {
  try {
    db.run('UPDATE brands SET brand_name = ?, brand_code = ? WHERE id = ?', [brandName, brandCode, id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-brand', async (event, id) => {
  try {
    db.run('DELETE FROM brands WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Units
ipcMain.handle('add-unit', async (event, { unit_name, unit_code }) => {
  try {
    db.run('INSERT INTO units (unit_name, unit_code) VALUES (?, ?)', [unit_name, unit_code]);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-units', async () => {
  try {
    const result = db.exec('SELECT * FROM units ORDER BY created_at DESC');
    const units = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: units };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-unit', async (event, { id, unit_name, unit_code }) => {
  try {
    db.run('UPDATE units SET unit_name = ?, unit_code = ? WHERE id = ?', [unit_name, unit_code, id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-unit', async (event, id) => {
  try {
    db.run('DELETE FROM units WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Products
ipcMain.handle('add-product', async (event, productData) => {
  try {
    db.run(`
      INSERT INTO products (product_name, barcode_item, barcode_box, category_id, sub_category_id, brand_id, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      productData.productName,
      productData.barcodeItem,
      productData.barcodeBox,
      productData.categoryId,
      productData.subCategoryId,
      productData.brandId,
      productData.imagePath
    ]);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-products', async () => {
  try {
    const result = db.exec(`
      SELECT
        p.*,
        c.category_name,
        sc.sub_category_name,
        b.brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `);
    const products = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-product', async (event, productData) => {
  try {
    db.run(`
      UPDATE products
      SET product_name = ?, barcode_item = ?, barcode_box = ?, category_id = ?, sub_category_id = ?, brand_id = ?, image_path = ?
      WHERE id = ?
    `, [
      productData.productName,
      productData.barcodeItem,
      productData.barcodeBox,
      productData.categoryId,
      productData.subCategoryId,
      productData.brandId,
      productData.imagePath,
      productData.id
    ]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Supplier IPC Handlers
ipcMain.handle('add-supplier', async (event, supplierData) => {
  try {
    db.run(`
      INSERT INTO suppliers (supplier_name, supplier_code, phone_number, whatsapp_number, address, email, type_of_item, jazzcash_easypaisa, bank_account_number, bank_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      supplierData.supplierName,
      supplierData.supplierCode,
      supplierData.phoneNumber,
      supplierData.whatsappNumber,
      supplierData.address,
      supplierData.email,
      supplierData.typeOfItem,
      supplierData.jazzcashEasypaisa,
      supplierData.bankAccountNumber,
      supplierData.bankName
    ]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-suppliers', async () => {
  try {
    const result = db.exec('SELECT * FROM suppliers ORDER BY created_at DESC');
    const suppliers = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: suppliers };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-supplier', async (event, supplierData) => {
  try {
    db.run(`
      UPDATE suppliers
      SET supplier_name = ?, supplier_code = ?, phone_number = ?, whatsapp_number = ?, address = ?, email = ?, type_of_item = ?, jazzcash_easypaisa = ?, bank_account_number = ?, bank_name = ?
      WHERE id = ?
    `, [
      supplierData.supplierName,
      supplierData.supplierCode,
      supplierData.phoneNumber,
      supplierData.whatsappNumber,
      supplierData.address,
      supplierData.email,
      supplierData.typeOfItem,
      supplierData.jazzcashEasypaisa,
      supplierData.bankAccountNumber,
      supplierData.bankName,
      supplierData.id
    ]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-supplier', async (event, id) => {
  try {
    db.run('DELETE FROM suppliers WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Purchase IPC Handlers
ipcMain.handle('add-purchase', async (event, purchaseData) => {
  try {
    console.log('=== ADD PURCHASE START ===');
    console.log('Purchase Data:', purchaseData);

    // Validate required fields - only productId is required
    if (!purchaseData.productId) {
      console.error('Missing required field: productId');
      return { success: false, error: 'Product Name is required' };
    }

    // Insert purchase using db.run()
    db.run(`
      INSERT INTO purchases (
        product_id, item_barcode, box_barcode, category_id, sub_category_id,
        brand_id, supplier_id, mfg_date, exp_date, purchase_date, quantity,
        unit, purchase_price, sale_price, min_wholesale_qty,
        wholesale_price, gst, total_amount, paid_amount, due_amount,
        packaging_type, num_cartons, boxes_per_carton, pieces_per_box,
        num_boxes, num_packs, pieces_per_pack, extra_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      purchaseData.productId,
      purchaseData.itemBarcode || '',
      purchaseData.boxBarcode || '',
      purchaseData.categoryId || 0,
      purchaseData.subCategoryId || 0,
      purchaseData.brandId || 0,
      purchaseData.supplierId || 0,
      purchaseData.mfgDate || '',
      purchaseData.expDate || '',
      purchaseData.purchaseDate || '',
      purchaseData.quantity || 0,
      purchaseData.unit || '',
      purchaseData.purchasePrice || 0,
      purchaseData.salePrice || 0,
      purchaseData.minWholesaleQty || 0,
      purchaseData.wholesalePrice || 0,
      purchaseData.gst || 0,
      purchaseData.totalAmount || 0,
      purchaseData.paidAmount || 0,
      purchaseData.dueAmount || 0,
      purchaseData.packagingType || '',
      purchaseData.numCartons || 0,
      purchaseData.boxesPerCarton || 0,
      purchaseData.piecesPerBox || 0,
      purchaseData.numBoxes || 0,
      purchaseData.numPacks || 0,
      purchaseData.piecesPerPack || 0,
      purchaseData.extraAmount || 0
    ]);

    console.log('Purchase inserted successfully');

    // Get the last inserted ID
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    console.log('New purchase ID:', id);

    // Save database to file
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    console.log('Database saved to:', dbPath);
    console.log('=== ADD PURCHASE SUCCESS ===');

    return { success: true, id };
  } catch (error) {
    console.error('=== ADD PURCHASE ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message || error.toString() || 'Failed to add purchase' };
  }
});

ipcMain.handle('get-purchases', async () => {
  try {
    const result = db.exec(`
      SELECT
        p.*,
        prod.product_name,
        c.category_name,
        sc.sub_category_name,
        b.brand_name,
        s.supplier_name
      FROM purchases p
      LEFT JOIN products prod ON p.product_id = prod.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `);
    const purchases = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: purchases };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-purchase', async (event, purchaseData) => {
  try {
    db.run(`
      UPDATE purchases
      SET product_id = ?, item_barcode = ?, box_barcode = ?, category_id = ?,
          sub_category_id = ?, brand_id = ?, supplier_id = ?, mfg_date = ?,
          exp_date = ?, purchase_date = ?, quantity = ?, unit = ?, purchase_price = ?,
          sale_price = ?, min_wholesale_qty = ?, wholesale_price = ?, gst = ?,
          total_amount = ?, paid_amount = ?, due_amount = ?,
          packaging_type = ?, num_cartons = ?, boxes_per_carton = ?, pieces_per_box = ?,
          num_boxes = ?, num_packs = ?, pieces_per_pack = ?
      WHERE id = ?
    `, [
      purchaseData.productId,
      purchaseData.itemBarcode || '',
      purchaseData.boxBarcode || '',
      purchaseData.categoryId || 0,
      purchaseData.subCategoryId || 0,
      purchaseData.brandId || 0,
      purchaseData.supplierId || 0,
      purchaseData.mfgDate || '',
      purchaseData.expDate || '',
      purchaseData.purchaseDate || '',
      purchaseData.quantity || 0,
      purchaseData.unit || '',
      purchaseData.purchasePrice || 0,
      purchaseData.salePrice || 0,
      purchaseData.minWholesaleQty || 0,
      purchaseData.wholesalePrice || 0,
      purchaseData.gst || 0,
      purchaseData.totalAmount || 0,
      purchaseData.paidAmount || 0,
      purchaseData.dueAmount || 0,
      purchaseData.packagingType || '',
      purchaseData.numCartons || 0,
      purchaseData.boxesPerCarton || 0,
      purchaseData.piecesPerBox || 0,
      purchaseData.numBoxes || 0,
      purchaseData.numPacks || 0,
      purchaseData.piecesPerPack || 0,
      purchaseData.id
    ]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-purchase', async (event, id) => {
  try {
    db.run('DELETE FROM purchases WHERE id = ?', [id]);
    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Sales
ipcMain.handle('get-products-with-stock', async () => {
  try {
    const result = db.exec(`
      SELECT
        p.id,
        p.product_name,
        p.barcode_item,
        p.barcode_box,
        MAX(pu.unit) as base_unit,
        MAX(pu.sale_price) as sale_price,
        MAX(pu.box) as box_price,
        MAX(pu.carton_qty) as items_per_box,
        MAX(pu.wholesale_price) as wholesale_price,
        MAX(pu.min_wholesale_qty) as min_wholesale_qty,
        MAX(pu.pieces_per_box) as pieces_per_box,
        MAX(pu.boxes_per_carton) as boxes_per_carton,
        MAX(pu.pieces_per_pack) as pieces_per_pack,
        SUM(pu.quantity) as available_stock
      FROM products p
      INNER JOIN purchases pu ON p.id = pu.product_id
      WHERE pu.quantity > 0
      GROUP BY p.id, p.product_name, p.barcode_item, p.barcode_box
      ORDER BY p.product_name ASC
    `);
    const products = result.length > 0 ? resultToArray(result) : [];
    console.log('📦 First Product Wholesale Data:', products.length > 0 ? {
      name: products[0].product_name,
      wholesale_price: products[0].wholesale_price,
      min_wholesale_qty: products[0].min_wholesale_qty
    } : 'No products');
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('search-purchase-products', async (event, searchQuery) => {
  try {
    const result = db.exec(`
      SELECT
        p.id as product_id,
        p.product_name,
        p.barcode_item,
        c.category_name,
        sc.sub_category_name,
        b.brand_name,
        MAX(pu.unit) as unit,
        MAX(pu.sale_price) as sale_price,
        SUM(pu.quantity) as available_stock
      FROM products p
      INNER JOIN purchases pu ON p.id = pu.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE pu.quantity > 0
        AND (
          LOWER(p.product_name) LIKE LOWER('%${searchQuery}%')
          OR LOWER(c.category_name) LIKE LOWER('%${searchQuery}%')
          OR LOWER(b.brand_name) LIKE LOWER('%${searchQuery}%')
          OR p.barcode_item LIKE '%${searchQuery}%'
        )
      GROUP BY p.id, p.product_name, p.barcode_item, c.category_name, sc.sub_category_name, b.brand_name
      ORDER BY p.product_name ASC
      LIMIT 10
    `);
    const products = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('complete-sale', async (event, saleData) => {
  try {
    // Generate unique sale ID
    const year = new Date().getFullYear();
    const countResult = db.exec('SELECT COUNT(*) as count FROM sales');
    const count = countResult[0].values[0][0] + 1;
    const saleId = `SALE-${year}-${String(count).padStart(6, '0')}`;

    // Insert sale record
    db.run(`
      INSERT INTO sales (
        sale_id, sale_date, sale_time, subtotal, discount, tax,
        grand_total, payment_method, amount_received, change_due, sold_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      saleId,
      saleData.sale_date,
      saleData.sale_time,
      saleData.subtotal,
      saleData.discount,
      saleData.tax,
      saleData.grand_total,
      saleData.payment_method,
      saleData.amount_received,
      saleData.change_due,
      saleData.sold_by,
      saleData.notes || ''
    ]);

    // Insert sale items and update stock
    for (const item of saleData.items) {
      // Insert sale item
      db.run(`
        INSERT INTO sale_items (
          sale_id, product_id, quantity, unit, rate_per_unit, line_total
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        saleId,
        item.product_id,
        item.quantity,
        item.unit,
        item.rate_per_unit,
        item.line_total
      ]);

      // Deduct from stock
      // Calculate quantity to deduct in base units
      let quantityToDeduct = item.quantity;

      // Convert to base unit if needed
      if (item.unit === 'g') {
        quantityToDeduct = item.quantity / 1000; // Convert grams to kg
      } else if (item.unit === 'box') {
        // Get items per box from purchases
        const boxResult = db.exec(`
          SELECT carton_qty FROM purchases
          WHERE product_id = ? AND carton_qty > 0
          LIMIT 1
        `, [item.product_id]);

        if (boxResult.length > 0 && boxResult[0].values.length > 0) {
          const itemsPerBox = boxResult[0].values[0][0];
          quantityToDeduct = item.quantity * itemsPerBox;
        }
      }

      // Deduct from oldest stock first (FIFO)
      let remainingToDeduct = quantityToDeduct;

      const stockResult = db.exec(`
        SELECT id, quantity FROM purchases
        WHERE product_id = ? AND quantity > 0
        ORDER BY created_at ASC
      `, [item.product_id]);

      if (stockResult.length > 0) {
        const stocks = resultToArray(stockResult);

        for (const stock of stocks) {
          if (remainingToDeduct <= 0) break;

          if (stock.quantity >= remainingToDeduct) {
            // This stock has enough
            db.run(`
              UPDATE purchases
              SET quantity = quantity - ?
              WHERE id = ?
            `, [remainingToDeduct, stock.id]);
            remainingToDeduct = 0;
          } else {
            // Use all of this stock and continue
            remainingToDeduct -= stock.quantity;
            db.run(`
              UPDATE purchases
              SET quantity = 0
              WHERE id = ?
            `, [stock.id]);
          }
        }
      }
    }

    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);

    return { success: true, sale_id: saleId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sales', async () => {
  try {
    const result = db.exec(`
      SELECT
        s.*,
        COALESCE(SUM(sr.refund_amount), 0) as total_returned,
        CASE WHEN SUM(sr.refund_amount) > 0 THEN 1 ELSE 0 END as has_returns,
        (s.grand_total - COALESCE(SUM(sr.refund_amount), 0)) as net_total
      FROM sales s
      LEFT JOIN sale_returns sr ON s.sale_id = sr.original_sale_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    const sales = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: sales };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sale-items', async (event, saleId) => {
  try {
    const result = db.exec(`
      SELECT
        si.*,
        p.product_name
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
      ORDER BY si.id ASC
    `, [saleId]);
    const items = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Sale Return IPC Handlers
ipcMain.handle('get-sale-by-invoice', async (event, invoiceNumber) => {
  try {
    const saleResult = db.exec(`
      SELECT * FROM sales WHERE sale_id = ?
    `, [invoiceNumber]);

    if (saleResult.length === 0 || saleResult[0].values.length === 0) {
      return { success: false, error: 'Sale not found' };
    }

    const sale = resultToArray(saleResult)[0];

    const itemsResult = db.exec(`
      SELECT
        si.*,
        p.product_name,
        p.barcode_item,
        si.quantity as original_quantity
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [invoiceNumber]);

    const items = itemsResult.length > 0 ? resultToArray(itemsResult) : [];

    const previousReturnsResult = db.exec(`
      SELECT * FROM sale_returns
      WHERE original_sale_id = ?
      ORDER BY return_date DESC, return_time DESC
    `, [invoiceNumber]);

    const previousReturns = previousReturnsResult.length > 0 ? resultToArray(previousReturnsResult) : [];

    const itemsWithReturnInfo = items.map(item => {
      const totalReturned = previousReturns
        .filter(ret => ret.product_id === item.product_id)
        .reduce((sum, ret) => sum + parseFloat(ret.quantity || 0), 0);

      const remainingQuantity = parseFloat(item.original_quantity) - totalReturned;

      return {
        ...item,
        quantity: item.original_quantity,
        total_returned: totalReturned,
        remaining_quantity: remainingQuantity,
        can_return: remainingQuantity > 0
      };
    });

    const groupedReturns = previousReturns.reduce((acc, ret) => {
      if (!acc[ret.return_id]) {
        acc[ret.return_id] = {
          return_id: ret.return_id,
          return_date: ret.return_date,
          refund_amount: 0,
          items: []
        };
      }
      acc[ret.return_id].refund_amount += parseFloat(ret.refund_amount || 0);
      acc[ret.return_id].items.push(ret);
      return acc;
    }, {});

    const previousReturnsGrouped = Object.values(groupedReturns);

    return {
      success: true,
      data: {
        sale,
        items: itemsWithReturnInfo,
        previousReturns: previousReturnsGrouped
      }
    };
  } catch (error) {
    console.error('get-sale-by-invoice error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-sale-return', async (event, returnData) => {
  try {
    // Generate return ID
    const year = new Date().getFullYear();
    const countResult = db.exec('SELECT COUNT(DISTINCT return_id) as count FROM sale_returns');
    const count = countResult[0].values[0][0] + 1;
    const returnId = `RET-${year}-${String(count).padStart(6, '0')}`;

    // Insert each returned item
    for (const item of returnData.items) {
      db.run(`
        INSERT INTO sale_returns (
          return_id, original_sale_id, return_date, return_time,
          product_id, product_name, quantity, unit, rate_per_unit,
          refund_amount, reason, processed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        returnId,
        returnData.original_sale_id || null,
        returnData.return_date,
        returnData.return_time,
        item.product_id,
        '', // product_name will be fetched via JOIN
        item.quantity,
        item.unit,
        item.rate_per_unit,
        item.line_total, // Individual item refund
        returnData.reason || '',
        returnData.returned_by
      ]);

      // Add quantity back to stock - find the latest purchase
      let quantityToAdd = item.quantity;

      // Convert to base unit if needed (grams to kg)
      if (item.unit === 'g') {
        quantityToAdd = item.quantity / 1000;
      }

      const purchaseResult = db.exec(`
        SELECT id, quantity FROM purchases
        WHERE product_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [item.product_id]);

      if (purchaseResult.length > 0 && purchaseResult[0].values.length > 0) {
        const latestPurchase = resultToArray(purchaseResult)[0];
        db.run(`
          UPDATE purchases
          SET quantity = quantity + ?
          WHERE id = ?
        `, [quantityToAdd, latestPurchase.id]);
      }
    }

    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);

    return { success: true, return_id: returnId };
  } catch (error) {
    console.error('process-sale-return error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sale-returns', async () => {
  try {
    const result = db.exec(`
      SELECT
        return_id,
        original_sale_id,
        return_date,
        SUM(refund_amount) as return_amount
      FROM sale_returns
      GROUP BY return_id, original_sale_id, return_date
      ORDER BY return_date DESC, return_id DESC
    `);
    const returns = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: returns };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sale-return-items', async (event, returnId) => {
  try {
    const result = db.exec(`
      SELECT
        sr.id,
        sr.return_id,
        sr.product_id,
        p.product_name,
        sr.quantity,
        sr.unit,
        sr.rate_per_unit,
        (sr.quantity * sr.rate_per_unit) as line_total
      FROM sale_returns sr
      LEFT JOIN products p ON sr.product_id = p.id
      WHERE sr.return_id = ?
      ORDER BY sr.id ASC
    `, [returnId]);

    const items = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: items };
  } catch (error) {
    console.error('get-sale-return-items error:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Purchase Returns
ipcMain.handle('get-purchase-by-id', async (event, purchaseId) => {
  try {
    const result = db.exec(`
      SELECT
        pu.id,
        pu.product_id,
        p.product_name,
        pu.supplier_id,
        s.supplier_name,
        pu.quantity,
        pu.unit,
        pu.purchase_price,
        pu.sale_price,
        pu.box,
        pu.carton_qty,
        pu.wholesale_price,
        pu.min_wholesale_qty,
        pu.packaging_type,
        pu.num_cartons,
        pu.boxes_per_carton,
        pu.pieces_per_box,
        pu.num_boxes,
        pu.num_packs,
        pu.pieces_per_pack,
        pu.extra_amount,
        pu.created_at
      FROM purchases pu
      INNER JOIN products p ON pu.product_id = p.id
      INNER JOIN suppliers s ON pu.supplier_id = s.id
      WHERE pu.id = ?
    `, [purchaseId]);

    const purchase = result.length > 0 ? resultToArray(result)[0] : null;
    return { success: true, data: purchase };
  } catch (error) {
    console.error('get-purchase-by-id error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-purchase-return', async (event, data) => {
  try {
    const {
      purchase_id,
      return_quantity,
      return_amount,
      reason,
      refund_method,
      supplier_id
    } = data;

    // Insert purchase return record
    db.run(`
      INSERT INTO purchase_returns (
        original_purchase_id,
        return_quantity,
        refund_amount,
        reason,
        refund_method,
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [purchase_id, return_quantity, return_amount, reason, refund_method]);

    // Get the return ID
    const returnResult = db.exec('SELECT last_insert_rowid() as id');
    const returnId = returnResult[0].values[0][0];

    // Update purchase quantity (reduce stock)
    db.run(`
      UPDATE purchases
      SET quantity = quantity - ?
      WHERE id = ?
    `, [return_quantity, purchase_id]);

    // Add supplier credit if applicable
    if (refund_method === 'credit') {
      db.run(`
        INSERT INTO supplier_credits (
          supplier_id,
          purchase_return_id,
          credit_amount,
          remaining_amount,
          created_at
        ) VALUES (?, ?, ?, ?, datetime('now'))
      `, [supplier_id, returnId, return_amount, return_amount]);
    }

    const dbPath = path.join(app.getPath('userData'), 'inventory.db');
    saveDatabase(dbPath);

    return { success: true, returnId };
  } catch (error) {
    console.error('process-purchase-return error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-purchase-returns', async () => {
  try {
    const result = db.exec(`
      SELECT
        pr.id,
        pr.original_purchase_id,
        pr.return_quantity,
        pr.refund_amount,
        pr.reason,
        pr.refund_method,
        pr.created_at,
        p.product_name,
        s.supplier_name,
        pu.unit
      FROM purchase_returns pr
      INNER JOIN purchases pu ON pr.original_purchase_id = pu.id
      INNER JOIN products p ON pu.product_id = p.id
      INNER JOIN suppliers s ON pu.supplier_id = s.id
      ORDER BY pr.created_at DESC
    `);

    const returns = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: returns };
  } catch (error) {
    console.error('get-purchase-returns error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-purchase-return-items', async (event, returnId) => {
  try {
    const result = db.exec(`
      SELECT
        pr.id,
        pr.original_purchase_id,
        pr.return_quantity,
        pr.refund_amount,
        pr.reason,
        pr.refund_method,
        pr.created_at,
        p.product_name,
        pu.unit,
        pu.purchase_price
      FROM purchase_returns pr
      INNER JOIN purchases pu ON pr.original_purchase_id = pu.id
      INNER JOIN products p ON pu.product_id = p.id
      WHERE pr.id = ?
    `, [returnId]);

    const items = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: items };
  } catch (error) {
    console.error('get-purchase-return-items error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-supplier-credits', async (event, supplierId) => {
  try {
    const result = db.exec(`
      SELECT
        sc.id,
        sc.credit_amount,
        sc.remaining_amount,
        sc.created_at,
        pr.return_quantity,
        p.product_name
      FROM supplier_credits sc
      INNER JOIN purchase_returns pr ON sc.purchase_return_id = pr.id
      INNER JOIN purchases pu ON pr.original_purchase_id = pu.id
      INNER JOIN products p ON pu.product_id = p.id
      WHERE sc.supplier_id = ? AND sc.remaining_amount > 0
      ORDER BY sc.created_at DESC
    `, [supplierId]);

    const credits = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: credits };
  } catch (error) {
    console.error('get-supplier-credits error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-all-purchased-items', async () => {
  try {
    const result = db.exec(`
      SELECT
        pu.id,
        pu.product_id,
        p.product_name,
        pu.supplier_id,
        s.supplier_name,
        pu.quantity,
        pu.unit,
        pu.purchase_price,
        pu.sale_price,
        pu.created_at
      FROM purchases pu
      INNER JOIN products p ON pu.product_id = p.id
      INNER JOIN suppliers s ON pu.supplier_id = s.id
      WHERE pu.quantity > 0
      ORDER BY pu.created_at DESC
    `);

    const items = result.length > 0 ? resultToArray(result) : [];
    return { success: true, data: items };
  } catch (error) {
    console.error('get-all-purchased-items error:', error);
    return { success: false, error: error.message };
  }
});
