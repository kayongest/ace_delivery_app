# Advanced Admin Analytics & Filtering

We are going to build a brand-new Analytics suite directly into the Ace Cafe Admin Dashboard, giving you deep insights into the cafe's performance.

## Proposed Changes

### 1. New "Analytics" Tab (`admin.php`)
I will add a 3rd toggleable tab to the admin dashboard navigation called **"Analytics"**. This will serve as your primary business overview screen.

### 2. High-Level KPI Cards
At the top of the Analytics tab, we will display beautifully styled "At a Glance" metric cards:
- **Total Revenue (RWF)**
- **Total Orders**
- **Average Order Value (RWF)**

### 3. Date-Range Filtering
I will add a sleek date filter dropdown or toggle buttons allowing you to instantly filter the analytics data by:
- **Today**
- **Last 7 Days**
- **This Month**
- **All Time**

### 4. Interactive Charts (`admin.js` & `Chart.js`)
I will integrate **Chart.js** to render a beautiful, interactive **"Revenue Over Time"** line or bar chart. The chart will dynamically update whenever you change the Date-Range filter.

### 5. Backend Aggregation (`api/analytics.php`)
I will create a highly optimized new backend endpoint specifically for analytics. It will:
- Aggregate total sales and order counts based on the requested date range.
- Group sales by date for the Chart.js dataset.
- (Bonus) Return a list of the **"Top Selling Items"** so you know what's popular!

## Open Questions

> [!IMPORTANT]
> **Chart Preference:** Would you prefer the "Revenue Over Time" visualization to be a sleek Line Chart (good for trends) or a Bar Chart (good for comparing specific days)? I default to a smooth, curved Line Chart as it looks very premium, but it's your call!

> [!TIP]
> Are there any other specific metrics you'd love to see on the dashboard? (e.g., Number of registered users, most popular category, etc.) Let me know, otherwise, I will stick to the core metrics above.

Once you are happy with this plan, simply click Proceed and I'll start building the Analytics engine!
