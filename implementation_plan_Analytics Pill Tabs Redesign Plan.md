# Analytics Pill Tabs Redesign Plan

We will redesign the Analytics section to consolidate "Orders Over Time", "Revenue Over Time", and "Top Selling Items" into a clean, modern "Pill Tabs" interface based on your design specifications.

## User Review Required

> [!IMPORTANT]
> **Counts on Tabs:** You requested a "count on top (right) of the pill-tabs". I will add dynamic badges to the top-right corner of each tab button (e.g., showing the Total Orders number on the "Orders Over Time" tab, and the Total Revenue on the "Revenue Over Time" tab). Please confirm if this is what you meant!
> 
> **Chart Rendering:** Chart.js has a known quirk where charts render incorrectly if they are initialized while hidden (e.g., inside an inactive tab). To prevent this, I will write custom Javascript to destroy and re-render the charts whenever you switch tabs.

## Proposed Changes

### [MODIFY] admin.php
- **Replace Analytics Grid**: Remove the current grid layout containing the separate "Revenue Over Time", "Top Selling Items", and "Orders Over Time" cards.
- **Implement Pill Tabs Card**: Insert the new Bootstrap-style card structure you provided.
- **Structure Tabs**:
  - **Tab 1: Orders Over Time**: Will contain the `ordersChart` canvas.
  - **Tab 2: Revenue Over Time**: Will contain the `revenueChart` canvas.
  - **Tab 3: Top Selling Items**: Will contain the `top-items-list` and the `stat-popular-cat` element.
- **Add Badges**: Add `<span>` elements to the tab links to hold the dynamic "count" values.

### [MODIFY] admin.css
- **Style Pill Tabs**: Since we are using vanilla CSS (not Bootstrap), I will write custom CSS to accurately replicate the `nav-pills`, `nav-item`, `nav-link`, `active`, `tab-content`, and `tab-pane` classes so they look exactly like premium Bootstrap pill tabs.
- **Badge Styling**: Add CSS to position the counts elegantly at the top right of each tab.

### [MODIFY] admin.js
- **Tab Switching Logic**: Implement the Javascript needed to handle clicking on the pill tabs (hiding/showing the respective `tab-pane` elements).
- **Dynamic Chart Re-rendering**: Update the `renderAnalytics` function to update the badge counts on the tabs, and ensure charts resize correctly when their parent tab becomes visible.

## Verification Plan
1. **Visual Check**: Open the Analytics dashboard and verify the three sections are now neatly organized inside a single card with clickable pill tabs.
2. **Functionality Check**: Click between the tabs to ensure the charts render correctly at full width, and the top-selling items list populates accurately.
3. **Responsive Check**: Verify the pill tabs scroll or stack nicely on mobile devices.
