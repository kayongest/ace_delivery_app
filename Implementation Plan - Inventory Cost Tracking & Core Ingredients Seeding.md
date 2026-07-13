# Implementation Plan - Inventory Cost Tracking & Core Ingredients Seeding

Extend the inventory management system to support tracking purchase costs, displaying the last updated timestamp (date & time) for stock levels, and seeding additional core kitchen ingredients (Potatoes, Salt, Sugar, and unit cleanups).

## Proposed Database Schema Changes

1. **Alter `inventory_items` Table**:
   - Add `cost_per_unit DECIMAL(10,2) DEFAULT 0.00` to track the unit price of each ingredient.
2. **Seed Core Ingredients**:
   - Insert `Potatoes` (perishable, KG, reorder 10, target 50, cost 800)
   - Insert `Salt` (non-perishable, KG, reorder 2, target 10, cost 500)
   - Insert `Sugar` (non-perishable, KG, reorder 5, target 25, cost 1200)
   - Fix unit for `Meat` (set unit to `KG` instead of current typo `40`).
   - Populate initial costs for existing items: `Rice` (1500), `Flour` (1200), `Meat` (4500), `Cooking Oil` (2200).

---

## Proposed Code Changes

### 1. Database Migrations
#### [NEW] [db_update_cost_and_items.php](file:///c:/xampp/htdocs/cafe_delivery/db_update_cost_and_items.php)
- A PHP CLI script to alter the database schema, apply cleanups, and seed the default items safely (using `INSERT IGNORE` or checking existence).

### 2. Admin Inventory API
#### [MODIFY] [admin_inventory.php](file:///c:/xampp/htdocs/cafe_delivery/api/admin_inventory.php)
- Update `save_item` to accept `cost_per_unit` from input payload and save it to the DB.
- Update `get_items` query to return `cost_per_unit` and format the `updated_at` timestamp.

### 3. Dashboard UI & Scripts
#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Update `inventoryTable` headers to include **Cost per Unit**.
- Add the **Cost per Unit** number input field inside the **Add/Edit Ingredient Modal** form.

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- Update table mapping in `renderInventoryItems()` to:
  - Render the new **Cost per Unit** column (e.g. `RWF 1,500 / KG`).
  - Display the last updated timestamp (`updated_at`) directly underneath the remaining stock quantity (e.g. `250.00 KG` over `2026-07-13 14:55`).
- Update `editInventoryItem()` and save submissions to bind and send `cost_per_unit`.

---

## Verification Plan

### Automated Migration
- Execute `php db_update_cost_and_items.php` and verify console success logs.

### Manual Verification
1. Open **Inventory** -> **Stock Levels** in the Admin Dashboard.
2. Verify that:
   - **Potatoes**, **Salt**, and **Sugar** are added to the list.
   - The unit for **Meat** shows `KG` instead of `40`.
   - A **Cost per Unit** column is visible showing prices.
   - **In Stock** column shows the quantity and the exact Date & Time it was updated (e.g. `90.00 KG` / `2026-07-13 14:55:59`).
3. Click **Add Ingredient** and verify the new **Cost per Unit** field is present and saves successfully.
4. Click **Edit** on an existing ingredient, change the cost, and verify it updates immediately.
