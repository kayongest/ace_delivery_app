# Advanced Analytics Implementation Plan

We will expand the new Pill Tabs Analytics dashboard by implementing **Sales by Category**, **Peak Busiest Hours**, **Customer Retention**, and **Order Status/Cancellation Rates**. We are intentionally skipping the Payment Method breakdown as requested since you only use COD.

## Proposed Changes

### 1. Database Queries (`api/analytics.php`)
I will add four new data streams to the analytics API response:
- **Sales by Category:** A query joining the `orders`, `order_items`, and `menu` tables to aggregate total revenue grouped by the menu category.
- **Peak Hours:** A query grouping the total volume of orders by the `HOUR(created_at)`.
- **Customer Retention:** A query that classifies orders into two buckets: "New Customer" (if it's their very first order in the system) and "Returning Customer" (if they've ordered before).
- **Order Status Breakdown:** A query grouping orders by their current status (`pending`, `completed`, `cancelled`) to easily spot fulfillment bottlenecks.

### 2. UI Layout (`admin.php`)
I will add four new tabs to the existing Pill Tabs card:
- **Sales by Category**
- **Peak Hours**
- **Customer Retention**
- **Order Status**

Each tab will contain a dedicated `<canvas>` element ready for Chart.js.

### 3. Chart Rendering (`admin.js`)
I will implement four new Chart.js visualisations:
- **Doughnut Chart** for Sales by Category (easily shows which category brings in the most cash).
- **Bar Chart** for Peak Hours (x-axis: hour of day, y-axis: number of orders).
- **Pie Chart** for Customer Retention.
- **Doughnut Chart** for Order Status (e.g., Green for completed, Yellow for pending, Red for cancelled).
- I will also ensure these new charts are hooked up to the resize logic so they perfectly fit the screen when their tab is clicked.

## Verification Plan
1. Once implemented, change the Date Filter on the dashboard to ensure the new charts update dynamically with the server data.
2. Verify that clicking through the new tabs renders the Doughnut, Bar, and Pie charts at the correct dimensions without graphical glitches.
