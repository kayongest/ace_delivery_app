# Implementation Plan - Advanced Storefront & Admin Enhancements

This plan outlines the architecture, database schema, and interface details for implementing the five premium features in the Cafe Delivery application:

1. **Promo Code & Discount Engine**
2. **Loyalty Points Redemption System**
3. **Real-time Order Tracking Timeline**
4. **Saved Address Book & Map Pinning (OpenStreetMap)**
5. **Product Reviews & Star Ratings with Photo Upload**

---

## Proposed Changes

### Database Schema Updates
We will create a database update script (`db_update_v2.php`) to execute the following schema additions:

1. **`coupons` Table**:
   ```sql
   CREATE TABLE IF NOT EXISTS coupons (
       id INT AUTO_INCREMENT PRIMARY KEY,
       code VARCHAR(50) NOT NULL UNIQUE,
       type ENUM('percent', 'flat') NOT NULL,
       value INT NOT NULL,
       min_order_amount INT DEFAULT 0,
       active TINYINT(1) DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. **`addresses` Table**:
   ```sql
   CREATE TABLE IF NOT EXISTS addresses (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       label VARCHAR(50) DEFAULT 'Home',
       address_text TEXT NOT NULL,
       latitude DECIMAL(10, 8) NULL,
       longitude DECIMAL(11, 8) NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```
3. **Table Alterations (`orders` & `reviews`)**:
   * Add `coupon_code`, `discount_amount`, and `points_redeemed` columns to the `orders` table.
   * Add a `photo` column (`VARCHAR(255) NULL`) to the `reviews` table for photo upload support.

---

### Component Implementation Details

### 1. Promo Code & Discount Engine
* **Admin Dashboard Tab**: A new **"Coupons"** tab in `admin.php` showing a table of active coupon codes, values, and an "Add Code" form.
* **Storefront Integration**: Hook up the promo code "Apply" button in the Cart Sidebar to validate the code via `api/apply_coupon.php`. Apply the discount visually to the breakdown table.
* **Checkout API (`api/checkout.php`)**: Validate coupon on checkout submission, deduct discount from total order amount, and record coupon details in the order.

### 2. Loyalty Points Redemption System
* **Cart Integration**: Display the customer's current points balance in the Cart Sidebar. Add a checkbox: *"Redeem [X] points for a [Y RWF] discount"*.
  * **Conversion Rate**: 1 Loyalty Point = 10 RWF discount.
* **Checkout API**: Deduct points from the user's account upon order completion if points were redeemed.

### 3. Real-Time Order Tracking Timeline
* **Customer Status Page**: A new customer page/modal `track_order.php` rendering a premium, status stepper:
  * `Pending` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Awaiting Pickup / Delivered`.
* **Real-time Synchronization**: The status stepper will poll `api/order_status.php?id=...` every 5 seconds to update the status timeline dynamically.
* **Admin Status Control**: Render a dropdown directly on the Orders tab list in the dashboard to let staff change statuses instantly.

### 4. Saved Address Book & Map Pinning
* **Profile Address Manager**: Add an "Addresses" sub-tab in the customer profile modal where users can manage saved delivery addresses.
* **Checkout Map Widget**: Embed a Leaflet.js (OpenStreetMap) map window during checkout when selecting "Deliver to new address". Dragging the marker yields latitude/longitude coordinates to attach to the delivery record.

### 5. Product Reviews with Photo Uploads
* **Review Modal**: Allow customers to rate (1-5 stars) and write comments directly under menu items. Add a file input element allowing reviews with food photos.
* **Storefront Ratings**: Display the average star rating (e.g. ⭐ 4.7) and total review count under item titles on menu cards.
* **Admin Moderation**: Add a reviews management grid in the admin panel to view and delete reviews.

---

## Verification Plan

### Automated/Manual Validation Steps
1. Run `db_update_v2.php` to initialize all database modifications.
2. Create promo codes in the admin panel and apply them in the customer cart to verify price deductions.
3. Place an order utilizing points redemption to verify points are deducted from the customer's balance.
4. Advance an order's status in the admin dashboard and monitor the customer tracking timeline updating in real-time.
5. Create a menu item review with a photo upload and verify it uploads to `uploads/reviews/` and lists the star rating under the product card.
