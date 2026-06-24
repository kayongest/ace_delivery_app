# User Authentication, Database, and .htaccess Implementation Plan

We will upgrade the application to use a MySQL database for managing users and menu items, implement an authentication system to secure the admin panel, and use `.htaccess` for cleaner URLs.

## User Review Required

> [!IMPORTANT]
> This upgrade will transition the application from a simple file-based data store (JSON) to a full MySQL database. Since you are using XAMPP, MySQL is readily available. I will write an initialization script that will automatically create the database, tables, and populate them with the default menu items and an admin user, so you won't need to manually configure the database via phpMyAdmin.

## Open Questions

> [!WARNING]
> 1. The default XAMPP MySQL credentials are usually username `root` with a blank password. Is this correct for your setup? If you have changed the default MySQL password, please let me know.
> 2. For the `.htaccess` rules, I plan to map `/admin` to `admin.php` and `/login` to `login.php`. Do you want any other specific URL rewrites?

## Proposed Changes

---

### Database Configuration

#### [NEW] [db.php](file:///c:/xampp/htdocs/cafe_delivery/db.php)
A script to establish a connection to the MySQL database. It will handle the connection using PDO for security against SQL injection.

#### [NEW] [init_db.php](file:///c:/xampp/htdocs/cafe_delivery/init_db.php)
A one-time initialization script that you can run in your browser. It will:
- Create the `cafe_delivery` database if it doesn't exist.
- Create a `users` table (id, username, password, role).
- Create a `menu` table (id, name, price, category, description, image).
- Insert a default admin user (e.g., username: `admin`, password: `adminpassword`).
- Migrate the existing menu items from `menu.json` into the new MySQL table.

---

### Authentication & Routing

#### [NEW] [.htaccess](file:///c:/xampp/htdocs/cafe_delivery/.htaccess)
Configuration for Apache to enforce clean URLs and secure access.
- `/admin` will route to `admin.php`
- `/login` will route to `login.php`

#### [NEW] [login.php](file:///c:/xampp/htdocs/cafe_delivery/login.php)
A simple login page for users to authenticate.

#### [NEW] [logout.php](file:///c:/xampp/htdocs/cafe_delivery/logout.php)
A script to destroy the session and log the user out.

---

### Backend API Updates

#### [MODIFY] [api/menu.php](file:///c:/xampp/htdocs/cafe_delivery/api/menu.php)
We will rewrite the API to perform CRUD operations on the MySQL `menu` table instead of the `menu.json` file. 

---

### Admin Dashboard Update

#### [DELETE] [admin.html](file:///c:/xampp/htdocs/cafe_delivery/admin.html)
#### [NEW] [admin.php](file:///c:/xampp/htdocs/cafe_delivery/admin.php)
We will convert `admin.html` to a PHP file. At the very top, we will add session checks to ensure that only logged-in users with the `admin` role can view the dashboard. Unauthenticated users will be redirected to the login page.

## Verification Plan

### Automated Steps
1. Navigate to `http://127.0.0.1/cafe_delivery/init_db.php` to initialize the database and tables automatically.

### Manual Verification
1. Visit `http://127.0.0.1/cafe_delivery/admin` - you should be redirected to the login page because you are not authenticated.
2. Log in using the default admin credentials.
3. Once logged in, verify you can access the admin dashboard and that the CRUD operations (Add, Edit, Delete) now interact with the MySQL database successfully.
4. Visit the main customer page (`http://127.0.0.1/cafe_delivery/`) and verify the menu still loads correctly from the new database.
