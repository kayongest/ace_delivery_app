# Admin Dashboard Redesign Plan

We will completely transform the current table-based admin dashboard into a sleek, modern card-based grid matching the image you uploaded.

## Open Questions
> [!IMPORTANT]
> The reference image has a single "View More" button on each card. Since this is an admin dashboard with CRUD capabilities, would you prefer:
> **Option A:** A single "Manage" button that opens your existing Add/Edit/Delete modal?
> **Option B:** Two buttons side-by-side ("Edit" and "Delete") styled in the same light teal color as the reference image?

## Proposed Changes

### 1. `admin.php`
- Replace the `<table class="admin-table">` structure with a new grid container `<div class="dealer-grid">`.
- Add the top header from the image:
  - Title (e.g., "Menu Administration").
  - Stats (e.g., "845 Items", with an arrow icon and text).
  - A settings/gear icon in the top right.
- Add pagination dots at the bottom.

### 2. `admin.css`
- Add new CSS variables and classes to match the image's color scheme (dark teal text `#1A3B47`, light teal buttons `#E3F0EE`, white card backgrounds, light grey borders).
- Style the cards:
  - Centered content.
  - Circular avatar images at the top (`80px` by `80px`, `border-radius: 50%`).
  - Subtle borders and box-shadows.

### 3. `admin.js`
- Rewrite the rendering logic to generate cards instead of table rows.
- Ensure the CRUD functionality (Edit/Delete) remains fully functional by binding the new buttons to the existing modal logic.
