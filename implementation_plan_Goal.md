# Goal
Add two new tabs to the Admin Dashboard (`admin.php`): **User Management** and **Reviews**. These tabs will allow the administrator to view and manage registered users and customer reviews.

## Proposed Changes

### Backend APIs

#### [NEW] [api/admin_users.php](file:///c:/xampp/htdocs/cafe_delivery/api/admin_users.php)
- Implement a `GET` endpoint to fetch all users from the `users` table, omitting passwords.
- Implement a `DELETE` endpoint to allow administrators to delete a user account by `user_id`.
- Ensure role-based access control (check if the session user is an admin).

#### [NEW] [api/admin_reviews.php](file:///c:/xampp/htdocs/cafe_delivery/api/admin_reviews.php)
- Implement a `GET` endpoint to fetch all reviews. Use `JOIN` to include the `users.full_name` and `menu.name` so the admin knows who left the review and for which item.
- Implement a `DELETE` endpoint to allow administrators to delete inappropriate reviews.
- Ensure role-based access control.

---

### Frontend UI & Logic

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- **Navigation Tabs**: Add "Users" and "Reviews" buttons to the `.admin-tabs` header.
- **Section Containers**:
  - Add `<div id="section-users" class="admin-section" style="display: none;">` containing a DataTable structure for users (`ID`, `Name`, `Email`, `Role`, `Joined`, `Actions`).
  - Add `<div id="section-reviews" class="admin-section" style="display: none;">` containing a DataTable structure for reviews (`ID`, `Customer`, `Item`, `Rating`, `Review`, `Date`, `Actions`).

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- **State Management**: Add functions `fetchUsers()` and `fetchAdminReviews()` to retrieve data from the new APIs.
- **Rendering Logic**:
  - Implement `renderUsers()` to populate the `#usersTable` DataTable.
  - Implement `renderAdminReviews()` to populate the `#reviewsTable` DataTable.
- **Actions**: Add `deleteUser(id)` and `deleteReview(id)` functions featuring the custom confirmation modal we previously built.
- **Tab Navigation Hook-in**: Ensure that switching to the new tabs automatically triggers fetching data if it hasn't been loaded yet.

## Verification Plan
### Automated Verification
- Run local PHP syntax checks against the new API files.

### Manual Verification
1. Access the Admin Dashboard and click on the **Users** tab. Verify all registered users are listed.
2. Click on the **Reviews** tab. Verify all reviews, including the associated customer names and menu item names, are correctly displayed.
3. Test the delete functions for both users and reviews using the custom confirmation modal.
4. Verify that DataTables handles sorting and searching correctly for the new tables.
