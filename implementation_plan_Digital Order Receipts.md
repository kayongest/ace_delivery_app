# Digital Order Receipts

We are going to build a beautiful, printable digital receipt system for Ace Cafe. 

## Proposed Changes

### 1. The Receipt Page (`receipt.php`)
I will create a new standalone page that displays a given order's details. 
- **Design:** It will be styled like a clean, modern cafe "thermal receipt" (centered, monospaced elements mixed with our premium fonts, dashed lines, and the Ace Cafe logo).
- **Features:** It will include a prominent **"Print Receipt"** button that triggers the browser's native print dialog (perfect for saving as PDF or printing to a physical printer).
- **Security:** The receipt will only be viewable by the **Admin** or the **Customer who placed the order**. (Guest orders can remain public if the user has the exact link).

### 2. Frontend Integration (Customer Side)
- **My Orders Modal:** I will add a `[View Receipt]` link next to each order in the customer's "My Orders" history.
- **Post-Checkout:** After successfully placing an order, the confirmation alert will include a prompt/link to view their receipt immediately.

### 3. Frontend Integration (Admin Side)
- **Admin Dashboard:** In the Orders tab, I will add a `[Print Receipt]` button next to each order so the admin can easily print them for the kitchen or the delivery driver.

## Open Questions

> [!IMPORTANT]
> **Design Preference:** I am planning to style this like a classic cafe "Thermal Receipt" (narrow, centered, minimalist). Alternatively, we could style it like a standard corporate "A4 Invoice" (wide, tables). Does the thermal receipt style sound good to you?

> [!IMPORTANT]
> **Guest Orders:** Since guest orders don't belong to a logged-in account, should anyone with the exact receipt link (`receipt.php?id=123`) be able to view it, or do you want to require an exact phone number match to view guest receipts? (I recommend letting the link be open so it's easy for guests to view their receipt right after checkout).

Once you approve this plan or provide your preferences, I will begin execution!
