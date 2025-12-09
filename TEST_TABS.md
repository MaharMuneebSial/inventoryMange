# Tab Testing Instructions

1. Open Dashboard page
2. Open browser console (F12)
3. Click on each dropdown item:
   - Category
   - Sub-Category
   - Brand
   - Supplier
   - Unit

4. Check console for these logs:
   - "Sub-Category clicked, setting activeTab to: sub-category"
   - "Dashboard activeTab changed to: sub-category"

5. Check if main content area shows the correct component

## Expected Behavior:
- Click "Category" → Category component shows
- Click "Sub-Category" → SubCategory component shows
- Click "Brand" → Brand component shows
- Click "Supplier" → Supplier component shows
- Click "Unit" → Units component shows

## Current Issue:
All tabs showing Category component regardless of which button is clicked.
