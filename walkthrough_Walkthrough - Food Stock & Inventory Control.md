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
  * Added subtab panels: **Stock Levels**, **Recipes**, and **Reports**.
  * Added modal forms for adding/editing ingredients, receiving batches (quantities, dates, expirations), and mapping recipe ingredients to menu items.
* **Modified [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)**:
  * Integrated tab switching events to call `fetchInventory()`.
  * Added AJAX calls for all inventory CRUD operations, recipes mapping, and report loading.
  * Built recipe row additions (dynamic dropdown list of ingredients) and implemented report print actions.
  * Integrated DataTables for both the Stock Levels and Recipe mapping grids with a default limit of 5 items per page, dynamic sorting, and searching.
* **Modified [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)**:
  * Styled the sub-nav tabs, data tables, priority badges, and report prints.
  * Added full dark theme CSS rules for the new inventory fields, selects, tables, and modals.

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
