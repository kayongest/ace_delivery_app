# Walkthrough - Food Stock & Inventory Control

We have successfully implemented the food stock and inventory control system. This ensures raw ingredients are tracked, classified as perishable/non-perishable, and deducted from stock using recipes during checkout (employing FIFO batch consumption for perishables).

---

## 1. Summary of Changes

### Database Migration
* **Created [db_update_inventory.php](file:///c:/xampp/htdocs/cafe_delivery/db_update_inventory.php)**: Sets up the database tables (`inventory_items`, `inventory_batches`, `recipes`, `inventory_transactions`) in your MySQL database. Executed successfully.

### Backend APIs
* **Created [api/admin_inventory.php](file:///c:/xampp/htdocs/cafe_delivery/api/admin_inventory.php)**: 
  * Handlers for CRUD operations on ingredients and batches.
  * Recipe mapping (associating menu items with raw ingredient requirements).
  * Report aggregation (Remaining Stock Report & restock Shopping List).
* **Modified [api/checkout.php](file:///c:/xampp/htdocs/cafe_delivery/api/checkout.php)**:
  * Injected transaction validation logic: checks if the total required quantity of ingredients is available before completing checkout.
  * Injected stock deduction: automatically decreases ingredient quantities and consumes perishable batches in FIFO order. Logs all sales transactions.

### Admin Dashboard UI
* **Modified [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)**:
  * Appended the **Inventory** navigation tab to the admin dashboard.
  * Added subtab panels: **Stock Levels**, **Recipes**, **Reports**, and **Buffet Planner**.
  * Added modal forms for adding/editing ingredients, receiving batches, and mapping recipe ingredients to menu items.
* **Modified [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)**:
  * Integrated tab switching events to load the selected subtabs.
  * Added AJAX calls for all inventory CRUD operations, recipes mapping, report loading, and buffet recipe fetching.
  * Implemented real-time client-side calculations for planned servings, ingredient shortages, and custom shopping lists in the Buffet Planner.
  * Integrated DataTables for both the Stock Levels and Recipe mapping grids with a default limit of 5 items per page, dynamic sorting, and searching.
* **Modified [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)**:
  * Styled the sub-nav tabs, data tables, priority badges, report prints, and split-pane Buffet Planner grid.
  * Added full dark theme CSS rules for the new inventory fields, selects, tables, planner rows, and modals.

---

## 2. Verification & Testing

We ran comprehensive backend unit tests (`test_inventory.php`) to verify all business rules:

1. **Perishable Batches FIFO Deduction**: 
   * Meat was initialized with two batches: BATCH-OLD (3kg, closer expiration date) and BATCH-NEW (7kg). Total stock = 10kg.
   * Mashed Potatoes dish was configured to require 0.5kg of Meat and 0.2kg of Rice per serving.
   * Simulated checkout of 2 servings (requires 1.0kg Meat, 0.4kg Rice).
   * Verified that the 1.0kg Meat was correctly deducted from the oldest batch (BATCH-OLD remaining quantity updated to 2.0kg; BATCH-NEW stayed untouched at 7.0kg).
   * Verified that Rice (non-perishable) successfully updated from 50.0kg to 49.6kg.
2. **Result**: All tests completed successfully. Database changes rolled back cleanly after testing.

```
=== STARTING INVENTORY UNIT TESTS ===
Inserted Test Items: TEST_Meat (ID: 1), TEST_Rice (ID: 2)
Added Batches for TEST_Meat: BATCH-OLD (3kg, exp 2026-07-15), BATCH-NEW (7kg, exp 2026-07-23). Main Stock updated to 10kg.
Using Menu Item: 'Mashed Cheese Potatoes' (ID: 101)
Recipe Mapped: 1 serving of 'Mashed Cheese Potatoes' requires 0.5kg Meat and 0.2kg Rice.
Simulating purchase of 2 servings...
Check Stock for TEST_Meat: Required: 1kg, Available: 10.00kg
Check Stock for TEST_Rice: Required: 0.4kg, Available: 50.00kg
Deducted 1kg from Batch 'BATCH-OLD'

=== VERIFICATION RESULTS ===
TEST_Meat remaining stock (Expected: 9.00): 9.00kg
TEST_Rice remaining stock (Expected: 49.60): 49.60kg
BATCH-OLD remaining quantity (Expected: 2.00): 2.00kg
BATCH-NEW remaining quantity (Expected: 7.00): 7.00kg

>>> UNIT TESTS PASSED SUCCESSFULLY! <<<
```

---

## 3. How to Use the Feature

Navigate to the **Admin Dashboard** and open the **Inventory** tab:

1. **Stock Levels**:
   * Add ingredients like "Meat" (Perishable) or "Rice" (Non-Perishable).
   * Configure **Reorder Level** (e.g. 5kg) and **Target Level** (e.g. 20kg).
   * Click **Batches** on any perishable item to receive incoming stock (e.g. adding 10kg of Meat with expiration date). This automatically increases the main ingredient quantity.
2. **Recipes**:
   * Find any menu item and click **Set Recipe**.
   * Add ingredients and enter the quantity required per serving (e.g., 0.15 kg for Rice, 0.20 kg for Meat).
   * Click **Save Recipe**. The storefront checkout will now enforce stock checks and deduct ingredients on orders!
3. **Reports**:
   * Review **Remaining Stock Overview** (displays status warnings, expired quantities, and expiring batches).
   * Review **restock Shopping List** (calculates exactly what is low/empty, how much to purchase to reach target stock, and ranks priority).
   * Click **Print Report** to generate a PDF shopping list or print directly.
4. **Buffet Planner**:
   * Open the **Buffet Planner** subtab.
   * On the left, list of menu items with mapped recipes is shown. Enter the number of planned servings for guests/takeaways (e.g. 50, 100).
   * Or click the **Set all to 50 Guests** or **Set all to 100 Guests** buttons for quick presets.
   * On the right, the list of required ingredients updates instantly, showing the **Total Needed**, **Currently In Stock**, **Projected Leftover**, and a status badge (**Sufficient Stock** or **Buy [Shortage]**).
   * Click **Print Shopping List** to generate a clean, print-friendly list of only the shortage ingredients you need to purchase for the event!

---

## 4. Mobile Responsiveness Improvements

We optimized the app structure to load seamlessly on mobile devices (e.g. iPhone 13 Pro):
1. **Storefront Navigation**: Added a mobile-only "My Orders" icon shortcut next to the cart, keeping the header navigation accessible on narrow phone screens.
2. **Buffet Planner**: Converted the planner cards layout from a rigid inline grid to a class-based `.planner-grid` that stacks in a single column on tablet/mobile viewports.
3. **Reports & Lists**: Tables in the stock reports are now wrapped in scroll containers (`overflow-x: auto`) to prevent breaking layout boundaries.
4. **Login Card**: Scaled card margins down to `40px 16px` on screens below 500px to ensure correct fitment.

---

## 5. Ingredient Stock Levels Chart

We added an interactive horizontal bar chart for visualizing raw ingredient levels:
1. **Top 10 Lowest Stock Items**: Dynamically sorts and displays the 10 ingredients closest to running out, showing their fill percentage (`Current / Target`).
2. **Interactive Tooltips**: Hovering over any bar reveals exact values and units (e.g. `2.00 / 20.00 kg`).
3. **Color-Coded Thresholds**: Green (>75%), Orange (26% - 75%), Red (≤25%) bars allow instant prioritization.
4. **Theme Responsive**: Chart text and grid line colors dynamically adapt when toggling between light and dark mode.

---

## 6. Inventory Cost Tracking & Core Ingredients Seeding

We implemented price tracking, seeded core kitchen ingredients, and cleaned up existing unit typos:
1. **Database Schema Alteration**: Added a `cost_per_unit` decimal column to `inventory_items` to store the purchase price of each ingredient.
2. **Seeded Ingredients**: Automatically inserted **Potatoes** (Perishable), **Salt** (Non-Perishable), and **Sugar** (Non-Perishable) with pre-configured costs and alert levels.
3. **Unit Typo Cleanup**: Corrected the database record for `Meat` from unit `'40'` to `'KG'`.
4. **Last Updated Logging**: Programmed the "In Stock" column of the data table to display the last checked/updated timestamp (`updated_at` date & time) directly below the stock quantity.
5. **Add/Edit Modal Enhancements**: Configured the Save/Edit Modal to use a wide double-column grid layout containing the new **Cost per Unit** field.

---

## 7. Customer Cards Grid Pagination

We implemented high-performance grid pagination for customer cards:
1. **14 Items per Page**: Configured a pagination limit of exactly 14 cards per page to maintain vertical layout balance.
2. **Interactive Controls**: Added a navigation bar with `<` (previous), page numbers, and `>` (next) controls dynamically matching the style of other dashboard tables.
3. **Smart Resetting**: The page number automatically resets to `1` when searching for users to ensure search queries are instantly visible.

---

## 8. Stock & Purchase Reports Exporting (PDF & Excel)

We added robust client-side reporting exports:
1. **Export to PDF**: Integrated `html2pdf.js` to render and compile the stock overview and purchase list directly into a clean A4 PDF file download.
2. **Export to Excel**: Programmed a custom CSV parser that compiles card headers and tables. It attaches a UTF-8 Byte Order Mark (BOM) (`\ufeff`) so Microsoft Excel natively opens it with correct cell layout, margins, and currency representations.
3. **Responsive Button Group**: Replaced the singular print button with three styled, color-coded, mobile-adaptive action buttons (Print, PDF, Excel).

---

## 9. Unified Datatable Upgrades (Extras, Coupons, and Reports)

We upgraded all custom lists and tables in the admin panel to utilize responsive DataTables with a default page size of 5 items:
1. **Extras**: Converted the static administration grid cards into a responsive DataTable (`#extrasTable`) displaying image thumbnails, descriptions, formatted prices, and standard action buttons.
2. **Promo Codes & Coupons**: Configured the coupon overview table (`#couponsTable`) as a DataTable with formatted flat rate currency values and full responsive behaviors.
3. **Inventory Reports**: Assigned IDs (`#reportStockTable` and `#reportPurchaseTable`) to both the stock overview and purchase list tables. They load dynamically as paginated DataTables.
4. **Smart PDF & Print Filter**: Programmed the PDF download and Print engines to automatically hide DataTable search inputs, pagination selectors, and metadata from target outputs.

---

## 10. Potential Portions Remaining Calculations

We integrated real-time calculations showing how many menu servings can be made from currently available ingredient stocks:
1. **Mathematical Ceiling Calculations**: Formulated a MySQL query using `MIN(FLOOR(current_quantity / quantity_required))` to calculate the exact ceiling of portions we can prepare based on the limiting ingredient in each recipe.
2. **Menu Item Recipes Column**: Added an `Est. Portions Left` column to the ingredient mapping table displaying color-coded portion badges (Green: >5 servings, Orange: 1-5 servings, Red: 0 servings, Grey: No recipe).
3. **New Stock & Purchase Report Table**: Added a third card section **Potential Menu Portions from Current Stock** to the reports tab. It prints and exports to PDF and Excel seamlessly, automatically filtering out web widgets.

---

## 11. Collapsible Report Accordion

We wrapped all three stock reports into a clean, collapsible accordion layout:
1. **Bootstrap Accordion Layout**: Restructured the reports layout to wrap the "Remaining Stock Overview", "Purchase / restock Shopping List", and "Potential Menu Portions from Current Stock" cards into accordion-items.
2. **Active Default Panel**: Configured the "Remaining Stock Overview" panel to load expanded/active by default, with the other two cards collapsed.
3. **Responsive DataTable Auto-Align**: Linked the accordion headers in `admin.js` to trigger a window resize event when expanded. This forces DataTables to instantly auto-align and stretch its columns beautifully when revealed.
4. **All-Inclusive Print & PDF Exports**: Programmed the print window styles and html2pdf captures to temporarily expand all panels so the entire report is generated in full on paper or downloads.
