-- Script to update products table to make category_id, sub_category_id, and brand_id optional
-- Run this in your SQLite database

-- Step 1: Create a new table with the updated schema
CREATE TABLE IF NOT EXISTS products_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  barcode_item TEXT UNIQUE,
  barcode_box TEXT,
  category_id INTEGER,
  sub_category_id INTEGER,
  brand_id INTEGER,
  image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Step 2: Copy data from old table to new table
INSERT INTO products_new (id, product_name, barcode_item, barcode_box, category_id, sub_category_id, brand_id, image_path, created_at)
SELECT id, product_name, barcode_item, barcode_box, category_id, sub_category_id, brand_id, image_path, created_at
FROM products;

-- Step 3: Drop old table
DROP TABLE products;

-- Step 4: Rename new table to products
ALTER TABLE products_new RENAME TO products;
