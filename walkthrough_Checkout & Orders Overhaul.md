# Checkout & Orders Overhaul

The end-to-end shopping and order management experience is fully functional! Here's a breakdown of the new features:

## 1. Guest Checkout Experience
- **Cart Grouping:** Adding the same item multiple times to the cart now correctly groups them and increments the quantity (e.g., `3x Espresso`) instead of listing duplicate rows.
- **Checkout Modal:** Clicking the **"Checkout"** button in the cart sidebar now opens a fast, clean Guest Checkout modal asking for the customer's Full Name, Phone Number, and Delivery Address.
- **Order Placement:** Submitting the form places the order instantly. A success message displays the Order ID, the cart is cleared, and the modal closes automatically.

## 2. Order Management Dashboard
- **Tab Navigation:** The Admin Dashboard (`admin.php`) now features a sleek toggleable tab system at the top. You can seamlessly switch between your **Menu Items** grid and the new **Orders** section without reloading the page.
- **Orders Table:** The Orders section displays all incoming orders chronologically. It shows:
  - The Order ID.
  - Customer Information (Name, Phone, Address).
  - A grouped list of the items they ordered and their quantities.
  - The Total Amount (RWF).
  - A color-coded status badge (Yellow for Pending, Teal for Preparing, Blue for Out for Delivery, etc.).
- **Live Status Updates:** Each order row includes a dropdown selector. You can easily click it to update the order's status (e.g., changing from `Pending` to `Preparing`), which saves to the database immediately and updates the badge color.

> [!TIP]
> **Try it out!** 
> 1. Go to your frontend (`http://127.0.0.1/cafe_delivery/`), add some items to your cart, and place an order through the new Checkout modal.
> 2. Then, visit your Admin Dashboard (`http://127.0.0.1/cafe_delivery/admin.php`), click the **Orders** tab, and watch your new order appear. Try changing its status!
