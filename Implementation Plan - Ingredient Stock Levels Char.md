# Implementation Plan - Ingredient Stock Levels Chart

Introduce a visual, real-time horizontal bar chart for the "Ingredient Stock Levels" panel in the Admin Dashboard. This chart will map the top 10 lowest stock ingredients as a percentage of their configured target quantities, making it easy to spot shortages at a single glance.

## User Review Required

> [!NOTE]
> - **Top 10 Lowest Stock Focus**: To prevent the chart from becoming overcrowded if you have dozens of ingredients, the chart will dynamically sort and display the top 10 items with the lowest stock fill percentage.
> - **Unit-Independent Percentage**: Each bar displays the ingredient fill level from `0%` to `100%` (calculated as `Current Stock / Target Stock`). This allows unit-independent comparison (e.g. comparing kg of meat directly with liters of milk).
> - **Dynamic Color Coding**:
>   - `0% - 25%`: Red (Critical/Out of Stock)
>   - `26% - 75%`: Orange (Low Stock Warning)
>   - `76% - 100%`: Green (Sufficient Stock)
> - **Dark Mode Synchronization**: The chart's grid lines and axis label text will dynamically update to remain readable when toggling between light and dark themes.

---

## Proposed Changes

### Component 1: Admin Dashboard UI

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Insert a `<canvas id="inventoryStockChart">` element inside a styled card container above the main Stock Levels table.

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- Implement `renderStockChart(items)`:
  - Formats stock level percentages.
  - Instantiates a horizontal bar chart with custom tooltip callbacks and dynamic color mappings.
  - Updates text colors (`#1A3B47` vs `#ffffff`) and grid line colors (`rgba(255,255,255,0.1)` vs `rgba(0,0,0,0.05)`) based on the active dark theme.
- Trigger `renderStockChart(cachedInventoryItems)` inside the item loading function (`renderInventoryItems()`).
- Trigger `renderStockChart(cachedInventoryItems)` inside the theme toggle click listener to seamlessly refresh label text colors when switching themes.

---

## Verification Plan

### Manual Verification
1. Open the Admin dashboard -> **Inventory** -> **Stock Levels**.
2. Verify that:
   - A horizontal bar chart loads above the table.
   - It lists the top lowest stock items by percentage.
   - Hovering over a bar reveals a tooltip showing the exact quantity, target, and unit (e.g., `10.00% (2.00 / 20.00 kg)`).
3. Toggle the theme button (light/dark mode) and verify that the chart labels change color accordingly to remain perfectly visible.
4. Add a new batch or edit an item's quantity, and verify that the chart immediately updates to reflect the new values.
