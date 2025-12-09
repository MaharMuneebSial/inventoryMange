# Complete Sale System Documentation

## Overview

A production-ready Point of Sale (POS) system for Pakistani grocery stores, general stores, super stores, bakeries, and mini marts with proper database normalization, real-time stock management, and comprehensive billing logic.

---

## Database Architecture

### Tables Created

#### 1. `sales` Table
Stores the main sale transaction details.

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL UNIQUE,          -- Format: SALE-2025-000001
  sale_date TEXT NOT NULL,                -- YYYY-MM-DD
  sale_time TEXT NOT NULL,                -- HH:MM:SS
  subtotal REAL NOT NULL,
  discount REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  payment_method TEXT NOT NULL,           -- cash, card, online, credit
  amount_received REAL NOT NULL,
  change_due REAL DEFAULT 0,
  sold_by TEXT,                           -- Cashier/username
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `sale_items` Table
Stores individual line items for each sale.

```sql
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL,                  -- FK to sales(sale_id)
  product_id INTEGER NOT NULL,            -- FK to products(id)
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,                     -- kg, g, pcs, box
  rate_per_unit REAL NOT NULL,
  line_total REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## Key Features

### 1. Product Selection (3 Methods)

#### A. Manual Product Selection
- Dropdown list showing all products with available stock
- Displays: Product Name - Stock: 100 kg

#### B. Item Barcode Scanning
- Scan individual item barcode
- Auto-fills: Product name, unit, rate
- Default quantity: 1

#### C. Box Barcode Scanning
- Scan box/carton barcode
- Auto-calculates: Total quantity from items per box
- Auto-fills pricing based on box price

### 2. Unit-Based Pricing Logic

#### Example: Rice (Sale Price = 100 PKR per KG)

| Customer Buys | Calculation | Price |
|--------------|-------------|-------|
| 1 KG | 100 × 1 | Rs. 100 |
| 500g | 100 × 0.5 | Rs. 50 |
| 2.5 KG | 100 × 2.5 | Rs. 250 |
| 1 Box (20 KG) | Box Price | Rs. 1900 |

#### Unit Conversion Logic
```javascript
// Gram to KG conversion
if (unit === 'g' && base_unit === 'kg') {
  rate_per_unit = sale_price / 1000;
}

// Box pricing
if (unit === 'box' && box_price exists) {
  rate_per_unit = box_price;
}
```

### 3. Stock Management (FIFO - First In, First Out)

#### Stock Deduction Process:
1. Sale completed → Calculate quantity in base units
2. Find oldest purchase record with available stock
3. Deduct from oldest first
4. If insufficient, move to next oldest
5. Update all affected purchase records

#### Example FIFO Flow:
```
Purchase History:
- Batch 1: 50 KG (2 days old)
- Batch 2: 100 KG (1 day old)

Sale: 75 KG
Result:
- Batch 1: 0 KG (fully used)
- Batch 2: 75 KG (25 KG deducted)
```

### 4. Automatic Calculations

```javascript
// Line Total
line_total = quantity × rate_per_unit

// Subtotal
subtotal = Sum of all line_totals

// Discount
if (discountType === 'percent') {
  discount_amount = (subtotal × discount) / 100
} else {
  discount_amount = discount
}

// Tax
after_discount = subtotal - discount_amount
tax_amount = (after_discount × tax_rate) / 100

// Grand Total
grand_total = after_discount + tax_amount

// Change Due
change_due = amount_received - grand_total
```

### 5. Sale ID Generation

Format: `SALE-YEAR-XXXXXX`

Example: `SALE-2025-000001`

```javascript
const year = new Date().getFullYear();
const count = totalSalesCount + 1;
const saleId = `SALE-${year}-${String(count).padStart(6, '0')}`;
```

---

## Component Features

### Sale.js Component

#### State Management
- `cart[]` - Array of cart items
- `products[]` - Products with available stock
- `subtotal`, `discount`, `tax`, `grandTotal` - Financial calculations
- `paymentMethod`, `amountReceived`, `changeDue` - Payment details
- `toast` - Success/error notifications

#### Key Functions

**`addToCart()`**
- Validates product selection
- Checks stock availability
- Converts units to base unit for stock check
- Calculates rate per unit
- Updates existing cart item or adds new
- Auto-focuses barcode input

**`updateCartQuantity()`**
- Real-time quantity updates
- Re-validates stock
- Recalculates line total
- Removes item if quantity is 0

**`completeSale()`**
- Validates payment amount
- Sends sale data to backend
- Receives generated sale_id
- Updates stock via FIFO
- Clears cart on success
- Shows success toast

**`calculateTotals()`**
- Auto-runs on cart/discount/tax changes
- Calculates subtotal
- Applies discount (fixed or %)
- Calculates tax
- Updates grand total

---

## Backend API (Electron IPC)

### 1. `get-products-with-stock`
Fetches all products with available stock from purchases table.

```javascript
SELECT
  p.id,
  p.product_name,
  p.barcode_item,
  p.barcode_box,
  pu.unit as base_unit,
  pu.sale_price,
  pu.box as box_price,
  pu.carton_qty as items_per_box,
  SUM(pu.quantity) as available_stock
FROM products p
LEFT JOIN purchases pu ON p.id = pu.product_id
GROUP BY p.id
HAVING available_stock > 0
```

### 2. `complete-sale`
Processes the entire sale transaction.

**Input:**
```javascript
{
  sale_date: "2025-01-15",
  sale_time: "14:30:45",
  subtotal: 1500.00,
  discount: 50.00,
  tax: 145.00,
  grand_total: 1595.00,
  payment_method: "cash",
  amount_received: 2000.00,
  change_due: 405.00,
  sold_by: "admin",
  notes: "Customer requested bag",
  items: [
    {
      product_id: 5,
      quantity: 2.5,
      unit: "kg",
      rate_per_unit: 100,
      line_total: 250
    }
  ]
}
```

**Output:**
```javascript
{
  success: true,
  sale_id: "SALE-2025-000042"
}
```

**Process:**
1. Generate unique sale_id
2. Insert into `sales` table
3. For each item:
   - Insert into `sale_items` table
   - Convert quantity to base unit
   - Deduct from oldest stock (FIFO)
   - Update `purchases` table
4. Save database
5. Return sale_id

### 3. `get-sales`
Retrieves all sales ordered by most recent.

### 4. `get-sale-items`
Gets all line items for a specific sale_id with product names.

---

## User Interface

### Main Layout (3 Sections)

#### Left Side (Product Selection)
1. **Barcode Scanner Input**
   - Auto-focus
   - Real-time barcode detection
   - Supports item & box barcodes

2. **Manual Selection Form**
   - Product dropdown (with stock info)
   - Quantity input (decimals allowed)
   - Unit selector (kg, g, pcs, box)
   - Add to Cart button

3. **Cart Table**
   - Product name
   - Editable quantity
   - Unit display
   - Rate per unit
   - Line total
   - Remove button
   - Empty state message

#### Right Side (Billing Summary)
1. **Financial Summary**
   - Subtotal display
   - Discount input (fixed or %)
   - Tax rate input (%)
   - Grand total (highlighted)

2. **Action Buttons**
   - Proceed to Payment (green)
   - Clear Cart (red)

3. **Quick Tips**
   - Keyboard shortcuts
   - Feature highlights

### Payment Modal
- Grand total recap
- Payment method selector
- Amount received input
- Auto-calculated change due
- Optional notes
- Cancel / Complete Sale buttons

### Toast Notifications
- Success: Green background
- Error: Red background
- Auto-dismiss: 3 seconds
- Slide-in animation
- Compact size

---

## Stock Validation Rules

### Before Adding to Cart:
```javascript
// Convert to base unit
let requiredStock = quantity;

if (unit === 'g' && base_unit === 'kg') {
  requiredStock = quantity / 1000;
}

if (unit === 'box' && items_per_box) {
  requiredStock = quantity × items_per_box;
}

// Check availability
if (available_stock < requiredStock) {
  showToast('error', 'Insufficient stock!');
  return;
}
```

### During Checkout:
- All cart items re-validated
- Stock checked in real-time
- Prevents overselling
- FIFO stock deduction

---

## Payment Methods

1. **Cash** - Default, physical currency
2. **Card** - Debit/Credit card
3. **Online** - JazzCash, EasyPaisa, Bank transfer
4. **Credit** - Store credit, pay later

---

## Real-World Scenarios

### Scenario 1: Rice Sale (Weight-based)
```
Product: Basmati Rice
Base Unit: KG
Sale Price: 180 PKR/KG
Available Stock: 500 KG

Customer buys: 3.5 KG
Calculation: 3.5 × 180 = Rs. 630
Stock after: 496.5 KG
```

### Scenario 2: Biscuit Sale (Box-based)
```
Product: Marie Biscuits
Base Unit: PCS
Items per Box: 24
Box Price: Rs. 480
Available Stock: 240 PCS

Customer buys: 2 Boxes
Calculation: 2 × 480 = Rs. 960
Stock after: 192 PCS (240 - 48)
```

### Scenario 3: Mixed Cart
```
Cart:
1. Rice 5 KG @ Rs. 180/KG = Rs. 900
2. Sugar 2 KG @ Rs. 120/KG = Rs. 240
3. Biscuit Box 1 @ Rs. 480 = Rs. 480

Subtotal: Rs. 1620
Discount: 5% = Rs. 81
Tax: 0%
Grand Total: Rs. 1539

Payment: Cash Rs. 2000
Change: Rs. 461
```

---

## Error Handling

### Common Errors & Solutions

1. **"Insufficient stock"**
   - Check available quantity
   - Verify unit conversion
   - Update stock via Purchase page

2. **"Please select a product"**
   - Select from dropdown
   - Or scan valid barcode

3. **"Amount received must be >= grand total"**
   - Enter correct payment amount
   - Minimum = grand total

4. **"Cart is empty"**
   - Add at least one product
   - Check stock availability

---

## Keyboard Shortcuts

- **Tab** - Navigate between fields
- **Enter** (in barcode) - Auto-add to cart
- **Esc** - Close modal

---

## Testing Checklist

- [ ] Add product via barcode
- [ ] Add product manually
- [ ] Scan box barcode
- [ ] Test kg to gram conversion
- [ ] Test box quantity calculation
- [ ] Verify stock deduction
- [ ] Test FIFO stock management
- [ ] Apply fixed discount
- [ ] Apply percentage discount
- [ ] Calculate tax correctly
- [ ] Test all payment methods
- [ ] Verify change calculation
- [ ] Check sale_id generation
- [ ] Test insufficient stock error
- [ ] Verify cart clear
- [ ] Test toast notifications
- [ ] Check empty cart validation

---

## Production Deployment

### Before Go-Live:
1. Test with real products
2. Verify barcode scanner compatibility
3. Train staff on POS usage
4. Set correct tax rates
5. Configure receipt printer (future)
6. Backup database regularly

### Daily Operations:
1. Start app via `start-app.bat`
2. Login with credentials
3. Navigate to Sale page
4. Process transactions
5. Close app (auto-saves database)

---

## Future Enhancements

- [ ] Print receipts
- [ ] Customer management
- [ ] Loyalty points
- [ ] Return/refund system
- [ ] Daily sales reports
- [ ] Low stock alerts
- [ ] Multi-currency support
- [ ] Barcode printer integration

---

## Support & Troubleshooting

### Database Location
```
C:\Users\[YourName]\AppData\Roaming\[AppName]\inventory.db
```

### Reset Database
Use `reset-database.bat` (WARNING: Deletes all data)

### View Sales History
Use SQL query:
```sql
SELECT * FROM sales ORDER BY created_at DESC;
```

---

## License
Production-ready for Pakistani retail businesses.
Built with Next.js, Electron, and SQL.js.

**Last Updated:** January 2025
