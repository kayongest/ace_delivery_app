# Shopping Cart Checkout & Order Management Plan

We will build a complete end-to-end checkout system for customers, and a dedicated section for you to manage incoming orders.

## Open Questions
> [!IMPORTANT]
> 1. **User Accounts:** Should customers be required to log in to place an order, or should we use a fast "Guest Checkout" where they simply provide their name, phone, and delivery address? *(Recommendation: Guest Checkout for maximum conversion)*
> 2. **Admin Layout:** Do you want the new Order Management section to be a separate page (e.g., `orders.php`), or a toggleable tab right inside your shiny new `admin.php` dashboard?
> 3. **Payment:** I am assuming "Cash on Delivery" (COD) for now. Is this correct?

## Proposed Changes

### 1. Database Schema (`db_update.php`)
We will create two new tables:
- `orders`: To store the customer details (Name, Phone, Address), total amount, order timestamp, and current `status` (Pending, Preparing, Out for Delivery, Delivered, Cancelled).
- `order_items`: To store the specific items and quantities associated with each order, locking in the price at the time of purchase.

### 2. Frontend Checkout (`app.js` & `index.html`)
- Clicking "Checkout" in the cart sidebar will open a clean modal asking for delivery details (Name, Phone, Address).
- Upon submission, it will send a POST request to a new `api/checkout.php` endpoint.
- We will consolidate the cart logic to handle item quantities properly (e.g., adding the same item twice increases its quantity instead of adding two separate rows).

### 3. Backend API (`api/checkout.php` & `api/orders.php`)
- `api/checkout.php`: Accepts the cart payload and customer details, validates the total, and saves the order to the database.
- `api/orders.php`: Handles fetching orders for the admin panel and updating order statuses.

### 4. Admin Order Management (`admin.php` & `admin.js`)
- Depending on your answer to the Open Questions, we will build a new view for Orders.
- Orders will be displayed in a clean, readable format.
- You will have a dropdown on each order to update its status (e.g., moving it from "Pending" to "Out for Delivery"), which will save to the database in real-time.
