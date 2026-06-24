# User Profiles & Polish (Toast Notifications)

We are going to implement the final polish features you requested: User Profiles with Image Uploads, and a sleek Toast Notification system with seamless AJAX updates.

## Proposed Changes

### 1. Database Update (`db_update_profile.php`)
- I will create a script to add a `profile_image` column to the `users` table.

### 2. User Profile CRUD (`api/auth/profile.php` & `index.html`)
- **Backend:** A new endpoint `api/auth/profile.php` that handles updating the user's name, phone, address, and processing profile image uploads.
- **Frontend (UI):** I will add a **"My Profile"** modal (accessible from the "My Account" dropdown) where users can view and edit their details and upload a profile picture.
- **Avatar Display:** When logged in, the "My Account" dropdown button will display their profile picture (or a default avatar) instead of just text!

### 3. Toast Notification System (`app.js` & `admin.js`)
- **Custom Toasts:** I will build a beautiful, animated Toast notification system (floating alerts in the corner of the screen) to replace all native browser `alert()` popups.
- **Where it will be used:**
  - When an item is added to the cart.
  - When an order is placed successfully.
  - When the admin creates, updates, or deletes a menu item.
  - When the admin updates an order status.
  - When a user updates their profile.
  - When a user logs in or logs out.

### 4. Seamless AJAX Updates (No Full Page Reloads!)
- **The Issue:** Currently, when a user logs in or out, the script triggers a full `window.location.reload()`, which causes the heavy "Ace Cafe" initial loader to play again.
- **The Fix:** I will rewrite the login/logout logic in `app.js` to dynamically update the navigation bar, update the session state, and show a success Toast—all *without* ever refreshing the browser! 

## Open Questions

> [!IMPORTANT]
> **Toast Position:** Where would you like the Toast notifications to appear? I recommend the **Bottom-Right** or **Top-Right** corner so they don't block the main content. (I'll default to Top-Right).

Once you approve this plan, I'll dive into the final code and get this super polished!
