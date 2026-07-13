# Implementation Plan - Buffet Planner & Stock Allocator

Introduce a **Buffet Planner & Stock Allocator** tool within the Inventory dashboard. This feature allows admins to quickly calculate the exact quantities of raw ingredients needed for large catered events, buffets, or bulk takeaway orders (e.g., 50+ people), comparing requirements against current stock levels in real time to produce instant shopping lists for events.

## User Review Required

> [!IMPORTANT]
> - **No Database Alterations**: The Buffet Planner will operate completely client-side by utilizing existing menu items, recipes, and ingredient stock values already in the database.
> - **Real-Time Calculation**: The allocation calculations will happen instantly in the browser as the user adjusts serving quantities.

## Open Questions

- None at this time.

---

## Proposed Changes

### Component 1: Admin Dashboard UI

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- **Add sub-tab navigation**: Add a "Buffet Planner" sub-tab button under the main Inventory header:
  ```html
  <button class="btn btn-secondary" id="subtab-planner-btn" onclick="switchInventorySubtab('planner')">Buffet Planner</button>
  ```
- **Add `#inv-subtab-planner` section**:
  - **Left Column**: List of all menu items with mapped recipes, showing name, price, and a number input for "Planned Servings" (default: 0). Include a quick preset button to set all active items to 50 servings.
  - **Right Column**: A real-time "Stock Allocation Results" table showing:
    - Ingredient Name
    - Total Needed
    - Current In Stock
    - Projected Leftover (or Shortage indicator in red)
  - **Bottom Action**: A "Print Buffet Shopping List" button to print a list of shortages specifically required to satisfy the planned buffet.

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- **Subtab Switching**: Extend `switchInventorySubtab` to handle the `'planner'` case and invoke `loadBuffetPlanner()`.
- **Logic Functions**:
  - `loadBuffetPlanner()`: Fetches the menu items, recipe configurations, and current stock levels.
  - `renderPlannerGrid()`: Renders the menu items selection inputs.
  - `calculateAllocation()`: Iterates over the selected servings, computes total raw ingredient requirements, matches them with current stock levels, and renders the dynamic results table.
  - `printBuffetShoppingList()`: Generates a printable PDF/page containing the custom shopping list for the planned event.

#### [MODIFY] [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)
- Add CSS layout rules for the split-pane Buffet Planner (grid layout, servings inputs, shortage highlights).

---

## Verification Plan

### Automated Verification
- Verify Javascript changes load without console errors on startup.

### Manual Verification
1. Navigate to **Inventory** -> click **Buffet Planner** subtab.
2. Select a menu item (e.g., "Beef Stew") that has a mapped recipe (e.g., 0.5kg Meat).
3. Type `50` in the "Planned Servings" input.
4. Verify that:
   - The right-hand allocation table immediately updates.
   - It lists "Meat" with "Total Needed: 25.00 kg".
   - It correctly compares this with current stock and highlights any shortages in red (e.g., if you have 10kg in stock, it displays "Shortage: -15.00 kg").
5. Click **Print Buffet Shopping List** and verify it opens a print view displaying only the shortage ingredients.
