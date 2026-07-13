# Implementation Plan - Mobile Responsiveness (iPhone 13 Pro & General Mobile)

Optimize both the customer storefront and the admin dashboard for mobile devices, specifically aiming for seamless display on resolutions like the iPhone 13 Pro (390px width). This ensures no horizontal layout breaking, unreadable fonts, or overflow.

## User Review Required

> [!NOTE]
> - **Storefront My Orders Shortcut**: We will add a dedicated "My Orders" shortcut icon in the mobile navigation bar. It will be hidden on desktop (avoiding duplication) and appear as a clean icon button on mobile so customers can quickly track orders.
> - **Responsive Grids & Cards**: We will convert inline grid layouts (like the Buffet Planner split column) to class-based grids that stack vertically on mobile.
> - **Table Overflow Scrolling**: Report cards that display large static lists will be wrapped with native touch-scroll containers to prevent breaking page boundaries.

---

## Proposed Changes

### Component 1: Customer Storefront

#### [MODIFY] [index.html](file:///c:/xampp/htdocs/cafe_delivery/index.html)
- Add a new button `#nav-my-orders-btn-mobile` to the `.nav-actions` container. This serves as a mobile-specific shortcut icon for "My Orders" since the main navigation links collapse on mobile.

#### [MODIFY] [app.js](file:///c:/xampp/htdocs/cafe_delivery/app.js)
- Wire up a listener for `#nav-my-orders-btn-mobile` that triggers a click on the existing `#nav-my-orders-link` to launch the order history modal or login modal.

#### [MODIFY] [styles.css](file:///c:/xampp/htdocs/cafe_delivery/styles.css)
- Add styling for `#nav-my-orders-btn-mobile`:
  - `display: none !important;` by default (desktop view).
  - Inside the `@media (max-width: 992px)` media query: `display: flex !important;` so it shows up neatly as an icon button on tablet/mobile views.

#### [MODIFY] [login.php](file:///c:/xampp/htdocs/cafe_delivery/login.php)
- Add a media query to the inline `<style>` block for the `.login-container` to reduce top margin and scale padding down on small screens, preventing the card from being squished or overflowing.

---

### Component 2: Admin Dashboard

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Replace inline grid styles on the Buffet Planner wrapper (line 573) with a responsive class `class="planner-grid"`.
- Replace inline flex styles on the Buffet Planner header (line 564) and Reports header (line 614) with class names `class="planner-header"` and `class="reports-header"`.
- Add `overflow-x: auto;` to the remaining stock and purchase list card wrappers to allow horizontal scrolling of these tables on very narrow devices.
- Add `flex-wrap: wrap;` style to the subtabs `.dashboard-actions` container so buttons wrap neatly on narrow viewports.

#### [MODIFY] [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)
- Define CSS styles and media queries for:
  - `.planner-grid`: 2-columns (1.2fr 1.8fr) on desktop, collapses to 1-column (`1fr`) on screens under `992px` wide.
  - `.planner-header` & `.reports-header`: flex rows on desktop, wraps and stacks button blocks in columns on screens under `768px` wide.
  - Add margins and focus padding tweaks for input fields inside small cards.

---

## Verification Plan

### Manual Verification
1. Open the storefront on a simulated iPhone 13 Pro viewport:
   - Verify the "My Orders" icon is visible in the top header and successfully triggers the login/orders drawer when clicked.
   - Verify the login card fits perfectly within the screen boundary.
2. Open the Admin panel on a simulated iPhone 13 Pro viewport:
   - Go to **Inventory** -> **Buffet Planner**: Verify the Planned Servings card stacks cleanly on top of the Stock Allocation results card, and the preset buttons stack neatly.
   - Go to **Inventory** -> **Reports**: Verify that the Remaining Stock and Purchase List tables scroll horizontally inside their card boundaries without breaking the main dashboard width.
   - Go to **Inventory** -> **Stock Levels** & **Recipes**: Verify the paginated DataTables collapse columns automatically (revealing the `+` child row trigger).
