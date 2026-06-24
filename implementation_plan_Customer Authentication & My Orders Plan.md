# Customer Authentication & My Orders Plan

We will build out a complete authentication system allowing customers to create accounts, save their details, and view their past orders.

## Proposed Changes

### 1. Database Schema Updates (`db_update_auth.php`)
- **`users` Table:** We will add three new columns: `full_name`, `phone`, and `address`. This allows the system to save their delivery details.
- **`orders` Table:** We will add a `user_id` column to link orders directly to the registered customer. (Guest checkouts will simply have a `NULL` user_id).

### 2. Backend Authentication APIs
We will create dedicated endpoints to handle user sessions securely:
- `api/auth/register.php`: Handles new account creation, encrypting passwords securely.
- `api/auth/login.php`: Validates credentials and starts a session.
- `api/auth/logout.php`: Clears the session.
- `api/auth/me.php`: Returns the currently logged-in user's details and their past orders.
- **Checkout Update:** Modify `api/checkout.php` to attach the logged-in user's ID to the order.

### 3. Frontend UI (`index.html`, `app.js`, `styles.css`)
- **Login/Register Modal:** We will build a sleek modal for customers to sign up or log in.
- **Dynamic Navbar:** The "Sign In" button will change to a "My Account" dropdown or button when logged in, giving them access to their profile and past orders.
- **Checkout Auto-fill:** When a logged-in user clicks checkout, their saved Name, Phone, and Address will automatically populate the form, making ordering instantaneous!
- **My Orders Modal:** A new interface where customers can see their order history and track the live status (Pending, Preparing, Delivered) of their current orders.

## Open Questions
> [!IMPORTANT]
> - **Username vs Email:** Do you prefer customers to log in using an `email` address or a unique `username`? *(Recommendation: Email address is standard for e-commerce to send receipts later).*
