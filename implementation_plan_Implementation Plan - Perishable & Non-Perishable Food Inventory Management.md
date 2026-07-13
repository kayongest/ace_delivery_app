# Implementation Plan - Perishable & Non-Perishable Food Inventory Management

Introduce a comprehensive ingredient inventory management system in the Cafe Delivery application, enabling admins to catalog raw ingredients (Meat, Rice, Tomatoes, etc.), classify them as perishable or non-perishable, track stock levels using batching (FIFO for perishables), link ingredients to menu items via recipes, auto-deduct ingredients during checkout, and view remaining stock and purchase reports.

## User Review Required

> [!IMPORTANT]
> - **Recipe Deductions during Checkout**: When a customer checks out, the system will look up the recipe for the ordered items. If any raw ingredient has insufficient stock, the checkout transaction will be rejected with an error message to the customer (e.g. *"Sorry, we do not have enough ingredients to prepare your order."*).
> - **FIFO Batching for Perishables**: Perishable ingredients will be deducted from the oldest fresh batch first. Non-perishables will be deducted from the general ingredient stock count.
> - **No Changes to Existing Checkout Interface**: The checkout frontend remains the same; the new logic operates as a backend validation and database deduction step inside the database transaction.

## Open Questions

- None at this time. The architecture maps perfectly to the existing database schema.

---

## Proposed Changes

### Component 1: Database Migration

#### [NEW] [db_update_inventory.php](file:///c:/xampp/htdocs/cafe_delivery/db_update_inventory.php)
- Check and create the following tables if they do not exist:
  - `inventory_items` (fields: `id`, `name`, `category`, `current_quantity`, `unit`, `reorder_level`, `target_quantity`, `updated_at`)
  - `inventory_batches` (fields: `id`, `inventory_item_id`, `batch_number`, `quantity_received`, `quantity_remaining`, `received_date`, `expiration_date`, `status`)
  - `recipes` (fields: `menu_id`, `inventory_item_id`, `quantity_required`)
  - `inventory_transactions` (fields: `id`, `inventory_item_id`, `type`, `quantity`, `note`, `created_at`)

---

### Component 2: Backend APIs

#### [NEW] [api/admin_inventory.php](file:///c:/xampp/htdocs/cafe_delivery/api/admin_inventory.php)
- Implement REST API for inventory administration (GET, POST, DELETE):
  - `action=get_items`: Fetch all inventory items.
  - `action=save_item`: Create/update an inventory item.
  - `action=delete_item`: Delete an inventory item.
  - `action=get_batches`: Fetch batches for a given `item_id`.
  - `action=save_batch`: Add a new batch for an item.
  - `action=delete_batch`: Delete/spoil a batch.
  - `action=get_recipes`: Fetch recipe configuration for menu items.
  - `action=save_recipe`: Save mapping of ingredients for a menu item.
  - `action=get_report`: Retrieve Remaining Stock and restock Shopping List reports.

#### [MODIFY] [api/checkout.php](file:///c:/xampp/htdocs/cafe_delivery/api/checkout.php)
- Inside the transaction block, before executing order insertions and final menu stock updates:
  - Query recipes of all ordered menu items and calculate total required ingredient quantities.
  - Validate that the required quantity of each ingredient does not exceed `inventory_items.current_quantity`. If insufficient, roll back and return a validation error.
  - Decrement the required amount from `inventory_items.current_quantity`.
  - Record negative transactions in `inventory_transactions` for sales audit.
  - For perishables, query active batches of the ingredient ordered by `expiration_date ASC` (FIFO) and deduct `quantity_remaining` until the required amount is fully satisfied.

---

### Component 3: Admin Dashboard UI

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- **Add Nav Tab**: Append an "Inventory" button to `.admin-tabs`.
- **Add Section**: Create `#section-inventory` container with four sub-tabs/sub-views:
  - **Stock Levels Tab**: Lists ingredients, category, in stock count, safety level, status badges, and action buttons ("Edit", "Manage Batches", "Delete").
  - **Batches Tab**: Form to add batches for perishables and review existing batch details (age, expiration).
  - **Recipes Tab**: Lists all menu items, showing what ingredients are mapped, with an "Edit Recipe" modal trigger.
  - **Reports Tab**: Two sections: "Current Stock Overview" and "Purchase / Shopping List" (with a "Print Report" action).
- **Add Modals**:
  - `#inventory-item-modal`: For adding/editing inventory items.
  - `#batch-modal`: For adding a batch (qty, batch #, received/expiration dates).
  - `#recipe-modal`: For editing ingredients mapped to a menu item (supports adding multiple ingredients and defining quantities).

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- **Tab switching**: Add event listener trigger `if (target === 'section-inventory') fetchInventory();`.
- **Logic Functions**:
  - `fetchInventory()`: Loads inventory items, recipes, batches, and reports.
  - `renderInventoryItems()`: Populates the ingredients table.
  - `renderRecipesGrid()`: Populates the menu recipe configuration lists.
  - `openInventoryItemModal()` / `saveInventoryItem()` / `deleteInventoryItem()`: Handlers for ingredient CRUD.
  - `openBatchModal()` / `saveBatch()` / `deleteBatch()`: Handlers for batch CRUD.
  - `openRecipeModal()` / `saveRecipe()`: Handlers for defining menu item recipes.
  - `fetchInventoryReports()`: Requests and renders the Remaining Stock and restock Purchase reports.

#### [MODIFY] [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)
- Add styling for the inventory sub-tabs, tables, status badges, and the print layout helper.

---

## Verification Plan

### Automated Verification
- Run `db_update_inventory.php` using XAMPP PHP CLI to ensure the new tables are created without errors.
- Test endpoint APIs using temporary testing scripts.

### Manual Verification
1. Open the Admin Dashboard -> Navigate to the new **Inventory** tab.
2. Add a perishable ingredient (e.g. "Meat", reorder level: 5kg, target level: 20kg) and a non-perishable ingredient (e.g. "Rice", reorder level: 10kg, target level: 50kg).
3. Add a batch for Meat of 15kg (perishable batch tracking).
4. Edit the recipe of a menu item (e.g., "Beef Stew") to require 0.5kg of Meat and 0.2kg of Rice.
5. Place an order for "Beef Stew" on the storefront:
   - Check if checkout completes successfully.
   - Verify that "Meat" quantity drops to 14.5kg and "Rice" to -0.2kg (if Rice was at 0).
   - Check that Meat's batch quantity decremented to 14.5kg.
6. Verify that the **Reports** section correctly displays Meat as "In Stock" and Rice as "Low Stock" or "Out of Stock" (with the target amount of 50.2kg to purchase).
