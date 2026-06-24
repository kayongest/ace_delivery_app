# Image Upload Implementation Plan

We will replace the text-based "Image Path" input in the Admin Dashboard with an actual file upload button, allowing you to upload images directly from your computer.

## User Review Required

> [!IMPORTANT]
> To support file uploads, we need to change how the application sends data to the server (from a JSON payload to `FormData`). We will also configure the server to securely accept the uploaded images and save them to the `images/` folder automatically.
> 
> Because PHP handles `PUT` requests with files poorly by default, we will modify the API to handle both Creates and Updates via `POST` requests.

## Open Questions

> [!WARNING]
> 1. Do you want images to be renamed automatically when uploaded to prevent files from overwriting each other if they share the same name (e.g. `menu_item_1701.png`), or keep their original filenames? (I recommend auto-renaming for safety).
> 2. Is the `images/` directory already writable by the server? (Usually yes in XAMPP, but good to keep in mind).

## Proposed Changes

---

### Admin Dashboard Update

#### [MODIFY] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
- Change the `item-image` input field from `type="text"` to `type="file" accept="image/*"`.
- If editing an item that already has an image, the file input will be optional. We will display a small preview of the current image next to the upload button so you know what is currently set.

#### [MODIFY] [admin.js](file:///c:/xampp/htdocs/cafe_delivery/admin.js)
- Modify the `form.addEventListener('submit', ...)` logic. Instead of sending a JSON object, we will construct a `FormData` object which can securely encapsulate both the text fields and the image file.
- Change the API call for updating an item to use the `POST` method instead of `PUT` (since PHP `$_FILES` works seamlessly with `POST`). We will include the `id` in the `FormData` to tell the server it's an update rather than a new creation.

---

### Backend API Update

#### [MODIFY] [api/menu.php](file:///c:/xampp/htdocs/cafe_delivery/api/menu.php)
- Refactor the `POST` handler to parse `$_POST` variables instead of a JSON input stream.
- Implement file upload logic:
  - Check if `$_FILES['image']` is present and valid.
  - Generate a unique filename (e.g., using `uniqid()`) to prevent overriding.
  - Move the uploaded file to the `../images/` directory using `move_uploaded_file()`.
- If an `id` is present in `$_POST`, treat it as an `UPDATE` query. If no `id` is present, treat it as an `INSERT` query.
- When updating an item, if a new image is not uploaded, the script will preserve the existing image path in the database.

## Verification Plan

### Manual Verification
1. Log in to the Admin Dashboard.
2. Click "Add New Item", fill out the details, click "Choose File" to select an image from your computer, and save. Verify the item is created and the image appears properly on the main cafe page.
3. Edit an existing item and upload a *new* image. Verify the image updates successfully.
4. Edit an existing item and change just the price (without uploading a new image). Verify the price updates and the old image remains intact.
