# Goal: Storefront Refinements, PDF Receipts & Security

This plan tackles the 3 next big milestones to polish the app, improve the customer experience, and tighten backend security. 

## Proposed Changes

### Phase 1: Storefront Refinements (UI/UX)
We will make the customer-facing storefront more interactive and visually stunning.

*   **[NEW] Product Details Modal:** Instead of just adding items directly to the cart, clicking an item card will open a beautiful popup modal. This modal will feature a large image, detailed description, ingredients/calories (if applicable), and display the **average customer rating** for that specific item.
*   **[MODIFY] Live Order Tracking UI:** We will upgrade the "My Orders" modal. Instead of just text saying "Status: Pending", we will build a visual progress bar (`Pending ➔ Preparing ➔ Out for Delivery ➔ Delivered`) that updates in real-time.
*   **[MODIFY] Dark Mode Toggle:** We will add a stylish Sun/Moon icon to the top navigation bar, allowing users to manually toggle the premium dark theme on or off and saving their preference.

### Phase 2: PDF Invoice & Receipt Generator
We will add professional, printable PDF generation to the existing order receipts.

*   **[MODIFY] `receipt.php`**: We will integrate a client-side PDF generation library (like `html2pdf.js`).
*   **[NEW] "Download as PDF" Button**: A clear call-to-action on the receipt page that instantly generates and downloads a clean, perfectly scaled A4 (or thermal) PDF receipt containing the order details, cafe logo, and total amounts.

### Phase 3: Security & Authentication Improvements
We will audit and tighten the backend to ensure data integrity and user safety.

*   **[MODIFY] API Endpoint Protection**: We will strictly enforce that normal users can *only* fetch their own orders and their own profile data via the API. Any unauthorized access attempts will be rejected.
*   **[MODIFY] Session Security**: We will implement `session_regenerate_id()` upon login to prevent session fixation attacks, and add HTTP-only flags to cookies if not already present.
*   **[MODIFY] Input Sanitization**: We will perform a sweep of our SQL queries (which mostly use PDO prepared statements already) to ensure absolute protection against SQL Injection, and add HTML sanitization for user-submitted reviews to prevent Cross-Site Scripting (XSS).

---

## Open Questions

> [!NOTE]
> **Favorites System:** Would you also like a "Favorites" (❤️) system where users can save their favorite menu items to a wishlist for easy ordering later? Let me know if we should include this in Phase 1.

## Verification Plan

1.  **Manual UI Testing**: Verify the new Product Modal opens smoothly, Dark Mode toggles correctly, and the Order Progress bar reflects the actual DB status.
2.  **PDF Generation**: Place a test order and verify the downloaded PDF is formatted cleanly and readable.
3.  **Security Audit**: Attempt to fetch another user's orders via API as a standard user to ensure the server explicitly blocks the request.
