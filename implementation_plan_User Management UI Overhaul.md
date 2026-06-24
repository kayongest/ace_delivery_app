# User Management UI Overhaul

The current User Management section utilizes a standard DataTables table. We will replace this with a grid-based "Customers" view featuring user avatar cards, a custom search input, and a new dedicated modal for managing user details (including profile photos).

## User Review Required

> [!WARNING]  
> This change replaces the searchable/sortable DataTable with a custom grid. The grid will include a custom search bar, but native table sorting (like clicking on a column header to sort by Join Date or Role) will no longer be available. If you need advanced filtering or sorting in the future, we'll need to build custom controls for that. Let me know if you are okay with losing table column sorting!

## Open Questions

> [!NOTE]  
> 1. In the `userManagement.png` reference image, the modal has a "Change Photo" text button and a circular image placeholder. I'll need to implement an image upload mechanism to actually upload and save the new profile pictures to the server. Are you okay with me adding a new API endpoint (`api/upload_avatar.php`) to handle image uploads?
> 2. Should we keep the background color of the 'Manage' button in the grid `var(--primary-color)` (the deep green used throughout the site) to match the reference image exactly?

## Proposed Changes

---

### `admin.php`

We will completely rewrite the `<div id="section-users">` structure.

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Remove the existing `<table id="usersTable">`.
- Add a new `<header>` section with an `<h2>ACE CAFE - Customers</h2>` title and a customized `<input type="text" id="user-search">` search bar aligned to the right.
- Add a `<div id="users-grid" class="users-grid">` which will serve as the container for the dynamically injected user cards.
- Add the HTML structure for the new Manage User modal (`<div id="manageUserModal" class="modal">`). It will contain:
  - Profile Image placeholder and a hidden `<input type="file" id="avatarUpload">`.
  - Input fields for Full Name, Email, Phone, Address, and Role.
  - Delete, Cancel, and Save Changes buttons matching the reference image.

---

### `admin.css`

We will add the styles necessary to create the new UI layouts.

#### [MODIFY] [admin.css](file:///c:/xampp/htdocs/cafe_delivery/admin.css)
- **Grid Layout**: Define `.users-grid` to use `display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 30px;` to match the spacing in the reference image.
- **User Card**: Styles for `.user-card`, `.user-avatar`, `.user-name`, and the Manage button.
- **Modal Styling**: Custom styles to make the modal look exactly like `userManagement.png` with a light background, rounded corners, soft shadows, split layout (avatar on left, form on right), and the specific button colors (Red for Delete, Dark Teal for Save).

---

### `admin.js`

We will rewrite the user management logic to handle rendering cards instead of populating a DataTable.

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- **`loadUsers()`**: Modify this function to generate HTML cards instead of pushing data to DataTables.
- **Search Logic**: Add a `'input'` event listener to the `#user-search` field to filter the rendered cards in real-time based on the user's name or email.
- **Modal Logic**: Add functions to open the new Manage User modal, populate its fields when a user is clicked, handle avatar preview on file selection, and submit the updated data (including the new image) to the server.

---

### Server-Side APIs

We need to add a new API to handle the avatar uploads and update the user update logic.

#### [NEW] `api/upload_avatar.php`
- A script to accept a `multipart/form-data` file upload, validate that it's an image, save it to an `uploads/avatars/` directory, and update the database's `profile_image` column for the specified user.

#### [MODIFY] `api/update_user.php`
- Update the logic to ensure that regular user details (name, email, phone, address, role) can be saved seamlessly alongside the avatar update process.

## Verification Plan

### Manual Verification
- Log in to the Admin Dashboard and navigate to the Users section.
- Verify the table is gone and replaced by the grid of user avatars.
- Test the search bar to ensure it instantly filters the grid.
- Click "Manage" on a user to verify the new modal opens and contains the correct data.
- Upload a new photo, change some text fields, and click "Save Changes". Verify the data persists and the grid updates.
- Verify the "Delete" button correctly removes the user.
