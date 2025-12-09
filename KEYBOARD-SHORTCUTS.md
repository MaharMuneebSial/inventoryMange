# Keyboard Shortcuts Guide

This inventory management application is fully keyboard-accessible. You can perform all operations without using a mouse.

## Global Navigation Shortcuts

### Dashboard Sidebar Navigation
- **Arrow Down** - Move to next menu item
- **Arrow Up** - Move to previous menu item
- **Enter** - Activate selected menu item (open page or toggle dropdown)
- **Home** - Jump to first menu item
- **End** - Jump to last menu item (Logout button)

### Data Table Navigation (Categories, Sub-Categories, Brands, Suppliers, Units, Sales Lists, Purchase Lists)
- **Arrow Down** - Select next row
- **Arrow Up** - Select previous row
- **Arrow Right** - Move to next action button (Edit/Delete/View)
- **Arrow Left** - Move to previous action button
- **Tab** - Navigate between action buttons
- **Enter** - Activate selected action (Edit/Delete/View)
- **Escape** - Close any open modal/popup
- **PageDown** - Go to next page (if pagination exists)
- **PageUp** - Go to previous page (if pagination exists)
- **Home** - Jump to first row
- **End** - Jump to last row

### Form Navigation (Product Entry, Purchase, Sale, Sale Return)
- **Tab** - Move to next form field
- **Shift + Tab** - Move to previous form field
- **Enter** - Submit form (when on submit button) or select dropdown item
- **Escape** - Close dropdowns or cancel operations
- **Arrow Down** - Navigate dropdown options (when dropdown is open)
- **Arrow Up** - Navigate dropdown options (when dropdown is open)

### Modal/Popup Keyboard Shortcuts
- **Escape** - Close modal/popup
- **Enter** - Confirm action (when focused on confirm button)
- **Tab** - Navigate between modal buttons
- **Arrow Left/Right** - Toggle between Cancel and Confirm buttons

## Page-Specific Shortcuts

### Dashboard (Initial System Setup)
**Sidebar Menu Items:**
1. Initial System Setup (Toggle Dropdown)
2. Category
3. Sub-Category
4. Brand
5. Supplier
6. Unit
7. New Product
8. Sale
9. Total Sales
10. Purchase
11. Total Purchases
12. Logout

**Usage:**
- Press **Arrow Down/Up** to navigate through menu items
- Press **Enter** to select/activate item
- Yellow highlight indicates keyboard selection
- Blue gradient indicates active tab

### Category Management
**Table Operations:**
- **Arrow Down/Up** - Navigate categories
- **Enter** - Activate selected action (Edit/Delete)
- **Arrow Right/Left** - Switch between Edit and Delete buttons

**Form Operations:**
- **Tab** to Category Name field (auto-focused on page load)
- Type category name
- **Tab** to Add Category button
- **Enter** to add category

**Edit Modal:**
- **Escape** - Cancel editing
- **Tab** - Move between fields and buttons
- **Enter** - Save changes (when on Save button)

**Delete Confirmation:**
- **Escape** - Cancel deletion
- **Arrow Left/Right** or **Tab** - Switch between Cancel and Delete buttons
- **Enter** - Confirm action

### Sub-Category Management
**Same keyboard shortcuts as Category**, plus:
- Dropdown navigation for selecting parent category
- **Arrow Down/Up** in category dropdown to select category
- **Enter** to confirm category selection

### Brand Management
**Same keyboard shortcuts as Category**

### Supplier Management
**Table Navigation:**
- **Arrow Down/Up** - Navigate suppliers
- **Enter** - Activate Edit or Delete action
- **Arrow Right/Left** - Switch between action buttons

**Form Navigation:**
- **Tab** through: Supplier Name → Phone → Address → Add button
- **Enter** to submit form

### Unit Management
**Same keyboard shortcuts as Category**

### Product Entry
**Form Navigation:**
1. Product Name (required) - Auto-focused
2. Category dropdown (optional) - **Arrow Down/Up** to select
3. Sub-Category dropdown (optional) - **Arrow Down/Up** to select
4. Brand dropdown (optional) - **Arrow Down/Up** to select
5. Barcode Item (optional)
6. Barcode Box (optional)
7. Image upload (optional) - **Enter** to trigger file picker
8. Add Product button - **Enter** to submit

**Search Dropdowns:**
- Start typing to filter options
- **Arrow Down/Up** to navigate filtered results
- **Enter** to select option
- **Escape** to close dropdown

### Sale
**Product Selection:**
- **Tab** to product search field
- Type to search products
- **Arrow Down/Up** to navigate search results
- **Enter** to select product

**Cart Operations:**
- **Tab** through quantity, rate, discount fields
- **Enter** to add product to cart
- Navigate to Remove button with **Tab**
- **Enter** to remove item from cart

**Checkout:**
- **Tab** through payment method, discount, tax fields
- **Enter** on Complete Sale button to finish transaction

### Sale Return
**Sale Selection:**
- **Tab** to Sale ID field
- Type Sale ID or use barcode scanner
- **Enter** to load sale

**Return Items:**
- **Tab** to return quantity field
- Enter quantity to return
- **Tab** to Return button
- **Enter** to process return

### Total Sales List
**Table Navigation:**
- **Arrow Down/Up** - Navigate sale records
- **Enter** - Open sale details modal
- **PageDown/PageUp** - Navigate between pages

**Sale Details Modal:**
- Auto-focuses on Close button when opened
- **Escape** - Close modal
- **Enter** - Close modal (when on Close button)

### Purchase & Total Purchases
**Same keyboard shortcuts as Sale and Sale Return**

## Tips for Efficient Keyboard Navigation

1. **Start with Arrow Keys** - Most tables and lists respond to Arrow Down/Up
2. **Use Tab for Forms** - Forms auto-focus on first field, use Tab to move through
3. **Use Enter to Activate** - Enter key activates buttons, selects options, and opens modals
4. **Use Escape to Cancel** - Escape closes modals, dropdowns, and cancels operations
5. **Watch for Visual Feedback:**
   - **Yellow highlight with ring** = Keyboard navigation active
   - **Blue ring** = Active element (from Tab/click)
   - **Blue gradient** = Selected/Active state

## Accessibility Features

- **Auto-focus**: Forms and modals automatically focus the first interactive element
- **Focus rings**: Clear visual indicators show which element has focus
- **Keyboard trapping**: Modals trap focus to prevent navigation outside
- **Skip navigation**: Tab key allows skipping between major sections
- **No mouse required**: Every function can be performed with keyboard alone

## Mouse vs Keyboard Behavior

- **Mouse click**: Removes keyboard selection, returns to normal mouse mode
- **Keyboard navigation**: Shows yellow highlight rings to indicate keyboard mode
- **Both modes work independently**: Switch between mouse and keyboard freely

## Getting Started with Keyboard Navigation

1. Open the application
2. Press **Arrow Down** to start navigating the sidebar menu
3. Press **Enter** to select a page
4. Once on a page with a table, press **Arrow Down** to start navigating rows
5. Press **Enter** to perform actions on selected rows
6. Use **Tab** to navigate through form fields
7. Press **Escape** to close any modal or popup

## Troubleshooting

**Q: Keyboard navigation not working?**
A: Make sure no modal is open. Close all modals with Escape first.

**Q: Can't see which item is selected?**
A: Look for the yellow highlight with a ring border. This indicates keyboard selection.

**Q: Arrow keys not working in forms?**
A: Arrow keys work in dropdowns and tables. Use Tab in regular form fields.

**Q: How do I switch between keyboard and mouse?**
A: Just start using either input method. They work independently.
