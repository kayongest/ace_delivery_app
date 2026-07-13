# Implementation Plan - Food Stock & Inventory Management

Add stock and inventory tracking to the Cafe Delivery application, enabling admins to set item availability and stock quantities, and automatically validating stock levels during checkout.

## User Review Required

> [!IMPORTANT]
> - Existing menu items will default to **"Unlimited"** stock (i.e. `track_stock = 0`, `stock_quantity = -1`, `is_available = 1`), meaning no change in user ordering flow until tracking is explicitly turned on.
> - Transactional stock validation in checkout will reject orders if any item runs out of stock, returning an error message to the customer.

## Open Questions
- None at this time.

---

## Proposed Changes

### Component 1: Database Migration

#### [NEW] [db_update_stock.php](file:///c:/xampp/htdocs/cafe_delivery/db_update_stock.php)
- Add the following columns to the `menu` table:
  - `track_stock` (`TINYINT(1)` DEFAULT 0)
  - `stock_quantity` (`INT` DEFAULT -1)
  - `is_available` (`TINYINT(1)` DEFAULT 1)

---

### Component 2: Backend APIs

#### [MODIFY] [api/menu.php](file:///c:/xampp/htdocs/cafe_delivery/api/menu.php)
- During `GET`, return the new fields: `track_stock`, `stock_quantity`, and `is_available`.
- During `POST` (create & update), parse and save the new parameters:
  - `track_stock` (0 or 1)
  - `stock_quantity` (integer)
  - `is_available` (0 or 1)

#### [MODIFY] [api/checkout.php](file:///c:/xampp/htdocs/cafe_delivery/api/checkout.php)
- Within the database transaction, fetch each item's availability, track_stock status, and stock quantity:
  - If `is_available = 0`, reject the order with *"Sorry, [item name] is currently unavailable."*
  - If `track_stock = 1` and `stock_quantity < quantity`, reject the order with *"Sorry, only [stock_quantity] of [item name] is left in stock."*
  - Decrement the stock quantity in the database: `UPDATE menu SET stock_quantity = stock_quantity - :qty WHERE id = :id`.

---

### Component 3: Admin Dashboard

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Update the item detail form (`#admin-form` modal) to include:
  - **Track Stock** select options ("No (Unlimited)", "Yes (Track Quantities)").
  - **Stock Quantity** number input (shown/hidden dynamically based on Track Stock choice).
  - **Availability Status** select options ("Available", "Unavailable").

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- Update `openModal()` to populate the new fields (`track_stock`, `stock_quantity`, `is_available`) when editing an item, and reset them when adding a new item.
- Toggle visibility of the stock quantity input container when "Track Stock" is changed.
- Include these fields in the `FormData` sent during form submission.
- Update `renderGrid()` to display a badges indicating stock levels/availability:
  - If `is_available == 0`: **Unavailable** (red badge)
  - If `track_stock == 1` and `stock_quantity == 0`: **Out of Stock** (red badge)
  - If `track_stock == 1` and `stock_quantity <= 5`: **Low Stock ([Qty])** (orange badge)
  - Else: **In Stock** or **Unlimited** (green badge/status text)

---

### Component 4: Storefront & Cart

#### [MODIFY] [app.js](file:///c:/xampp/htdocs/cafe_delivery/app.js)
- Update storefront menu rendering (`renderMenu`):
  - If an item's `is_available == 0` or (`track_stock == 1` and `stock_quantity == 0`), disable the "Add" button and render it as "Sold Out" (with styled class or styling).
  - If low stock (`track_stock == 1` and `stock_quantity <= 5` and `stock_quantity > 0`), display a badge/text showing *"Only [Qty] left!"*.
- Update `openModal()` (Item Details modal):
  - Disable the add-to-order button and label it "Sold Out" if unavailable.
- Update `window.addToCart`:
  - Verify if adding to cart exceeds stock levels.
  - If the item tracks stock and the cart quantity equals or exceeds `stock_quantity`, show a toast warning: *"Cannot add more of this item; maximum stock limit reached."*
- Update `window.updateQuantity` (Cart sidebar):
  - Similarly, limit manual incrementing if it exceeds the item's available stock.

#### [MODIFY] [styles.css](file:///c:/xampp/htdocs/cafe_delivery/styles.css)
- Add CSS classes/styles for:
  - Sold out badges, disabled buttons, and low stock warnings.

---

## Verification Plan

### Automated Tests
- Run `db_update_stock.php` to verify the schema is correctly updated without issues.
- Send mock order requests (e.g. via `curl` or temporary scripts) to `api/checkout.php` to check:
  - Success when stock is sufficient.
  - Failure/rejection when items are unavailable or out of stock.
  - Stock quantity decrementing accurately on success.

### Manual Verification
1. Open the Admin Dashboard, modify an item to track stock, and set its quantity to 3.
2. Go to the Storefront. Try to add 4 of this item to the cart. Verify it toasts a warning at 3 items.
3. Check out the order. Verify that:
   - The checkout completes successfully.
   - The stock quantity in the database decreases.
4. Set an item's availability to "Unavailable" or stock to 0 in the Admin Dashboard.
5. Verify the storefront menu shows it as "Sold Out" with a disabled add button.
