# Customer Accounts & Authentication

The customer authentication system is now fully live! Here's a breakdown of the new capabilities:

## 1. Sign Up & Login Modal
- **Seamless UI:** Clicking "Sign In" in the top navigation bar opens a beautiful glassmorphic modal with tabs for **Login** and **Register**.
- **User Profiles:** During registration, customers provide their Full Name, Email Address, Phone Number, and Default Delivery Address. All passwords are cryptographically hashed and stored securely.

## 2. Smart Navbar & "My Account"
- Once logged in, the "Sign In" button automatically transforms into a personalized **"Hi, [Name]"** dropdown menu.
- **Admin Access:** If the logged-in user is an admin (e.g., `admin@acecafe.com`), an exclusive link to the **Admin Dashboard** will appear in their dropdown.
- Customers can easily log out at any time from this menu.

## 3. Auto-filling Checkout
- **Instant Ordering:** When a logged-in customer clicks "Checkout" from their cart, their Name, Phone, and Address are **automatically pre-filled** into the checkout form based on their saved profile. No more repetitive typing!
- Guest checkout remains fully functional for users who prefer not to create an account.

## 4. "My Orders" Dashboard
- Customers can click **"My Orders"** from their account dropdown to view their entire purchase history.
- The interface displays past and current orders, including the exact items, total spent, date, and a **live color-coded status badge** (e.g., Pending, Preparing, Out for Delivery) updated in real-time as the admin changes the status on the backend!

> [!TIP]
> **Try it out!** 
> 1. Go to the [frontend](http://127.0.0.1/cafe_delivery/) and click "Sign In".
> 2. Register a new account.
> 3. Add an item to your cart and hit Checkout—notice how your details are instantly filled in!
> 4. Place the order, then check your **My Orders** panel from the top right dropdown.
