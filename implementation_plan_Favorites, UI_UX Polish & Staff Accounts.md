# Implementation Plan: Favorites, UI/UX Polish & Staff Accounts

This plan outlines the next phase of development based on your selected priorities: 1 (Favorites), 2 (UI Polish), 3 (Admin Expansion), and 4 (Take a breather at the end!).

## Proposed Changes

### Phase 1: Customer "Favorites" System
- **Database Addition**: Create a new `favorites` table linking `user_id` to `menu_id`.
- **UI Update**: Add a small heart icon (<i class="ph ph-heart"></i>) to the corner of each menu item card.
- **Interactivity**: Clicking the heart will toggle it (filled vs outline) and send an API request to save/remove the favorite.
- **Filtering**: Add a "My Favorites" filter button next to the category tabs so users can instantly see their saved items.

### Phase 2: UI/UX Polish
- **Menu Cascade Animation**: We will utilize the `anime.js` library (already loaded) to create a beautiful, staggered slide-up animation whenever the menu renders or a category filter is clicked.
- **Hover Enhancements**: Deepen the glassmorphism blur and shadow effects slightly when hovering over cards to make them feel more tactile.
- **Smooth Modals**: Enhance the modal entrance animations so they fade and scale up smoothly rather than just appearing.

### Phase 3: Admin Expansion (Staff Accounts)
- **Database Modification**: Update the `role` ENUM in the `users` table from `('admin', 'customer')` to `('admin', 'staff', 'customer')`.
- **Role Permissions**:
    - `admin`: Full access to everything (Analytics, Menu Management, Staff Management).
    - `staff`: Can only view and update the status of incoming **Orders**. They cannot edit the menu or see business analytics.
- **Admin UI Update**: Add a "Staff" tab to the Admin Dashboard (visible only to `admin`s) allowing the owner to create new staff accounts quickly.

## Verification Plan
### Automated & Manual Verification
- We will execute MySQL statements to verify table creation and enum modifications.
- Log in as a customer to test adding and removing favorites, and verifying they persist on refresh.
- Log in as an Admin to create a Staff account, then log in as that Staff member to ensure unauthorized tabs (Menu, Analytics) are successfully hidden/blocked.

## User Review Required

> [!IMPORTANT]
> **Questions for you before we proceed:**
> 1. Are you happy with the `staff` role restriction (i.e., they can only manage orders, not edit the menu or view analytics)?
> 2. For the "Favorites" filter, should it be a separate tab like the categories (e.g. "Coffee", "Pastries", "Favorites"), or a dedicated section in the "My Profile" modal? (I recommend adding it as a Category tab for easiest access!).

Once you approve, I'll execute these changes!
