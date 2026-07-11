<?php
session_start();
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'staff'])) {
    header("Location: login.php");
    exit;
}
$isAdmin = $_SESSION['role'] === 'admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | Ace Cafe</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Magra:wght@400;700&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css?v=<?= time() ?>">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.8/css/dataTables.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/3.0.2/css/responsive.dataTables.min.css">
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/responsive/3.0.2/js/dataTables.responsive.min.js"></script>
    <!-- Load custom admin.css LAST to override DataTables -->
    <link rel="stylesheet" href="admin.css?v=<?= time() ?>">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
    <div class="admin-container">
        <header class="admin-header">
            <h1>Admin Dashboard</h1>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button id="theme-toggle-btn" class="btn btn-secondary" style="background: none; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; padding: 6px 12px; cursor: pointer;">
                    <i class="ph ph-moon" id="theme-icon" style="font-size: 18px;"></i>
                </button>
                <a href="./" class="btn btn-secondary">Back to Cafe</a>
                <a href="logout.php" class="btn btn-secondary">Logout</a>
            </div>
        </header>

        <div class="admin-tabs" style="display: flex; gap: 20px; margin-bottom: 20px; border-bottom: 1px solid #eee;">
            <?php if ($isAdmin): ?>
            <button class="admin-tab-btn active" data-target="section-menu" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #1A3B47; border-bottom: 2px solid #1A3B47; cursor: pointer;">Menu Items</button>
            <?php endif; ?>
            <button class="admin-tab-btn <?= !$isAdmin ? 'active' : '' ?>" data-target="section-orders" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: <?= !$isAdmin ? '#1A3B47' : '#8c9ea6' ?>; border-bottom: 2px solid <?= !$isAdmin ? '#1A3B47' : 'transparent' ?>; cursor: pointer;">Orders</button>
            <?php if ($isAdmin): ?>
            <button class="admin-tab-btn" data-target="section-extras" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Extras</button>
            <button class="admin-tab-btn" data-target="section-users" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Users</button>
            <button class="admin-tab-btn" data-target="section-coupons" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Coupons</button>
            <button class="admin-tab-btn" data-target="section-staff" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Staff</button>
            <button class="admin-tab-btn" data-target="section-reviews" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Reviews</button>
            <button class="admin-tab-btn" data-target="section-analytics" style="background: none; border: none; font-size: 16px; font-weight: 600; padding: 10px 0; color: #8c9ea6; border-bottom: 2px solid transparent; cursor: pointer;">Analytics</button>
            <?php endif; ?>
        </div>

        <?php if ($isAdmin): ?>
        <div id="section-menu" class="admin-section">
            <header class="dashboard-header">
                <div class="dashboard-title-area">
                    <h2>Menu Items</h2>
                    <div class="dashboard-stats">
                        <span id="item-count-label" class="stat-highlight">0 Items</span>
                        <span class="stat-icon">↗</span>
                        <span class="stat-text">Manage your catalog</span>
                    </div>
                </div>
                  <div class="dashboard-actions" style="display: flex; gap: 12px; align-items: center;">
                      <div style="position: relative;">
                          <input type="text" id="menu-search-input" placeholder="Search menu..." style="padding: 8px 12px 8px 34px; border: 1px solid #e1e3e5; border-radius: 6px; font-size: 14px; width: 220px; outline: none; transition: all 0.2s; font-family: "Magra", sans-serif;" onfocus="this.style.borderColor='#1A3B47'; this.style.boxShadow='0 0 0 3px rgba(26,59,71,0.1)';" onblur="this.style.borderColor='#e1e3e5'; this.style.boxShadow='none';">
                          <svg style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #8c9ea6;" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <button id="add-new-btn" class="btn btn-manage-light" style="padding: 8px 16px;">+ Add New</button>
                  </div>
            </header>

            <div class="dealer-grid" id="admin-menu-list">
                <!-- Populated by admin.js -->
            </div>
            
            <!-- Pagination Container -->
            <div id="admin-menu-pagination" style="display: flex; justify-content: center; margin-top: 30px; gap: 8px;"></div>
        </div>

        <div id="section-extras" class="admin-section" style="display: none;">
            <header class="dashboard-header">
                <div class="dashboard-title-area">
                    <h2>Extras & Condiments</h2>
                    <div class="dashboard-stats">
                        <span id="extras-count-label" class="stat-highlight">0 Extras</span>
                        <span class="stat-icon">↗</span>
                        <span class="stat-text">Manage condiment add-ons</span>
                    </div>
                </div>
                <button id="add-new-extra-btn" class="btn btn-manage-light" style="padding: 8px 16px;">+ Add New Extra</button>
            </header>

            <!-- Preview of what it looks like on the storefront -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 25px; border-radius: 16px; margin-bottom: 30px; max-width: 450px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                <p style="font-size: 11px; font-weight: bold; color: #8c9ea6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Storefront Preview:</p>
                <div style="border-top: 1px dashed rgba(122, 28, 36, 0.2); padding-top: 15px;">
                    <p style="font-size: 12px; font-weight: 700; color: var(--brand-red); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Add Extras:</p>
                    <div id="admin-extras-preview-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <!-- Dynamically populated storefront preview cards -->
                    </div>
                </div>
            </div>

            <!-- Table/Grid of Extras with full CRUD actions -->
            <div class="dealer-grid" id="admin-extras-list">
                <!-- Populated by admin.js -->
            </div>
        </div>

        <div id="section-coupons" class="admin-section" style="display: none;">
            <header class="dashboard-header">
                <div class="dashboard-title-area">
                    <h2>Promo Codes & Coupons</h2>
                    <div class="dashboard-stats">
                        <span id="coupon-count-label" class="stat-highlight">0 Coupons</span>
                        <span class="stat-icon">↗</span>
                        <span class="stat-text">Manage discount coupons</span>
                    </div>
                </div>
                <button id="add-new-coupon-btn" class="btn btn-manage-light" style="padding: 8px 16px;">+ Add New Coupon</button>
            </header>

            <div class="glass" style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid var(--border-color); overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-weight: 600;">
                            <th style="padding: 12px 16px;">Code</th>
                            <th style="padding: 12px 16px;">Type</th>
                            <th style="padding: 12px 16px;">Value</th>
                            <th style="padding: 12px 16px;">Min Order</th>
                            <th style="padding: 12px 16px;">Status</th>
                            <th style="padding: 12px 16px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-coupons-list">
                        <!-- Populated by admin.js -->
                    </tbody>
                </table>
            </div>
        </div>
        <?php endif; ?>

        <div id="section-orders" class="admin-section" style="display: <?= !$isAdmin ? 'block' : 'none' ?>;">
            <header class="dashboard-header" style="border-bottom: none; padding-bottom: 0;">
                <div class="dashboard-title-area">
                    <h2>Orders</h2>
                    <div class="dashboard-stats">
                        <span id="order-count-label" class="stat-highlight">0 Orders</span>
                        <span class="stat-icon">↗</span>
                        <span class="stat-text">Manage incoming orders</span>
                    </div>
                </div>
            </header>

            <div class="orders-tabs" style="display: flex; gap: 20px; border-bottom: 1px solid #e1e3e5; margin-bottom: 20px; padding: 0 20px;">
                <button class="order-filter-btn active" onclick="filterOrders(this, 'all')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #111; font-weight: 600; border-bottom: 2px solid #007bff; cursor: pointer;">All</button>
                <button class="order-filter-btn" onclick="filterOrders(this, 'unpaid')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #8c9ea6; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer;">Unpaid</button>
                <button class="order-filter-btn" onclick="filterOrders(this, 'paid')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #8c9ea6; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer;">Paid</button>
                <button class="order-filter-btn" onclick="filterOrders(this, 'pending')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #8c9ea6; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer;">Pending</button>
                <button class="order-filter-btn" onclick="filterOrders(this, 'delivered')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #8c9ea6; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer;">Delivered</button>
                <button class="order-filter-btn" onclick="filterOrders(this, 'cancelled')" style="background: none; border: none; padding: 10px 0; font-size: 14px; color: #8c9ea6; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer;">Cancelled</button>
            </div>

            <div class="table-responsive">
                <table id="ordersTable" class="display" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment status</th>
                            <th>Fulfillment status</th>
                            <th>Items</th>
                            <th>Delivery method</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-orders-list">
                        <!-- Populated by admin.js -->
                    </tbody>
                </table>
            </div>
        </div>

        <?php if ($isAdmin): ?>
        <div id="section-users" class="admin-section" style="display: none;">
            <header class="dashboard-header" style="justify-content: space-between; align-items: center; border-bottom: none; margin-bottom: 20px;">
                <div class="dashboard-title-area">
                    <h2 style="font-family: 'Magra', sans-serif; font-size: 24px; color: #1A3B47;">ACE CAFE - Customers</h2>
                </div>
                <div class="dashboard-actions" style="display: flex; gap: 15px; align-items: center;">
                    <div style="position: relative;">
                        <input type="text" id="user-search-input" placeholder="Search customers..." style="padding: 10px 15px 10px 35px; border: 1px solid #e1e3e5; border-radius: 6px; font-size: 14px; width: 250px; outline: none; transition: all 0.2s; font-family: 'Magra', sans-serif;" onfocus="this.style.borderColor='#1A3B47'; this.style.boxShadow='0 0 0 3px rgba(26,59,71,0.1)';" onblur="this.style.borderColor='#e1e3e5'; this.style.boxShadow='none';">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #8c9ea6; font-size: 16px;"></i>
                    </div>
                    <button type="button" class="btn btn-primary" id="add-user-btn" style="background-color: #1A3B47; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">+ Add User</button>
                </div>
            </header>

            <div id="admin-users-grid" class="users-grid">
                <!-- Populated by admin.js -->
            </div>
        </div>

        <!-- New User Management Modal -->
        <div id="manageUserModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
            <div class="modal-content" style="max-width: 500px; padding: 30px; border-radius: 12px; background: #fff;">
                <h2 id="manage-user-modal-title" style="margin-top: 0; color: #1A3B47; font-family: 'Magra', sans-serif; font-weight: 700; margin-bottom: 25px;">Manage User</h2>
                <div style="display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;">
                    <!-- Avatar Column -->
                    <div style="display: flex; flex-direction: column; align-items: center; width: 120px; flex-shrink: 0;">
                        <div id="user-avatar-preview" style="width: 100px; height: 100px; border-radius: 50%; background-color: #E8F1EF; color: #1A3B47; display: flex; align-items: center; justify-content: center; font-size: 14px; overflow: hidden; margin-bottom: 10px;">
                            No Img
                        </div>
                        <input type="file" id="user-avatar-upload" accept="image/*" style="display: none;">
                        <button onclick="document.getElementById('user-avatar-upload').click()" style="background: none; border: none; font-weight: 700; color: #333; font-size: 13px; cursor: pointer;">Change Photo</button>
                    </div>
                    
                    <!-- Form Column -->
                    <div style="flex-grow: 1; min-width: 250px;">
                        <input type="hidden" id="manage-user-id">
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #1A3B47; font-weight: 600; font-size: 13px;">Full Name</label>
                            <input type="text" id="manage-user-name" name="manage-user-name" class="form-input" style="width: 100%; border-radius: 6px; padding: 10px;">
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #1A3B47; font-weight: 600; font-size: 13px;">Email <span style="color:red">*</span></label>
                            <input type="email" id="manage-user-email" name="manage-user-email" class="form-input" style="width: 100%; border-radius: 6px; padding: 10px;" required>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #1A3B47; font-weight: 600; font-size: 13px;">Password</label>
                            <input type="password" id="manage-user-password" name="manage-user-password" class="form-input" style="width: 100%; border-radius: 6px; padding: 10px;" placeholder="Leave blank to keep unchanged">
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #1A3B47; font-weight: 600; font-size: 13px;">Phone Number</label>
                            <input type="text" id="manage-user-phone" name="manage-user-phone" class="form-input" style="width: 100%; border-radius: 6px; padding: 10px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; font-weight: 700; color: #4A606A; font-size: 13px; margin-bottom: 5px;">Address</label>
                            <textarea id="manage-user-address" name="manage-user-address" class="form-input" rows="2" style="width: 100%; border-radius: 6px; padding: 10px;"></textarea>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 25px;">
                            <label style="display: block; font-weight: 700; color: #4A606A; font-size: 13px; margin-bottom: 5px;">Role</label>
                            <select id="manage-user-role" name="manage-user-role" class="form-input" style="width: 100%; border-radius: 6px; padding: 10px;">
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 20px;">
                    <button id="manage-user-delete" style="background-color: #ff4d4f; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Delete</button>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="closeModal('manageUserModal')" style="background-color: #f0f2f5; color: #1A3B47; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Cancel</button>
                        <button id="manage-user-save" style="background-color: #1A3B47; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="section-reviews" class="admin-section" style="display: none;">
            <header class="dashboard-header">
                <div class="dashboard-title-area">
                    <h2>Customer Reviews</h2>
                    <div class="dashboard-stats">
                        <span class="stat-highlight">Monitor and manage feedback</span>
                    </div>
                </div>
            </header>

            <div class="table-responsive">
                <table id="reviewsTable" class="display" style="width: 100%;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid #e1e3e5; color: #111;">
                            <th style="width: 40px; text-align: center;"><input type="checkbox"></th>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Item</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Date</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-reviews-list">
                        <!-- Populated by admin.js -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="section-analytics" class="admin-section" style="display: none;">
            <header class="dashboard-header" style="flex-wrap: wrap;">
                <div class="dashboard-title-area">
                    <h2>Analytics Overview</h2>
                    <div class="dashboard-stats">
                        <span class="stat-highlight">Business Insights</span>
                    </div>
                </div>
                <div class="dashboard-actions">
                    <select id="analytics-date-filter" class="form-input" style="width: auto; cursor: pointer;">
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="month">This Month</option>
                        <option value="alltime">All Time</option>
                    </select>
                </div>
            </header>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <!-- Card 1: Total Revenue (#2D2424) -->
                <div style="background-color: #2D2424; border-radius: 6px; overflow: hidden; position: relative; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="padding: 20px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; opacity: 0.8; font-weight: 600;">Total Revenue</h3>
                        <p id="stat-revenue" style="font-size: 32px; font-weight: bold; margin: 0;">RWF 0</p>
                        <i class="ph-fill ph-coins" style="position: absolute; right: 15px; top: 15px; font-size: 60px; opacity: 0.15; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </div>
                    <a href="#" style="display: block; background: rgba(0,0,0,0.2); padding: 8px 15px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 13px; text-align: center; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                        View Detail <i class="ph ph-arrow-circle-right" style="vertical-align: middle; margin-left: 5px;"></i>
                    </a>
                </div>

                <!-- Card 2: Total Orders (#5C3D2E) -->
                <div style="background-color: #5C3D2E; border-radius: 6px; overflow: hidden; position: relative; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="padding: 20px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; opacity: 0.8; font-weight: 600;">Total Orders</h3>
                        <p id="stat-orders" style="font-size: 32px; font-weight: bold; margin: 0;">0</p>
                        <i class="ph-fill ph-shopping-cart" style="position: absolute; right: 15px; top: 15px; font-size: 60px; opacity: 0.15; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </div>
                    <a href="#" style="display: block; background: rgba(0,0,0,0.2); padding: 8px 15px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 13px; text-align: center; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                        View Detail <i class="ph ph-arrow-circle-right" style="vertical-align: middle; margin-left: 5px;"></i>
                    </a>
                </div>

                <!-- Card 3: Avg Order Value (#B85C38) -->
                <div style="background-color: #B85C38; border-radius: 6px; overflow: hidden; position: relative; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="padding: 20px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; opacity: 0.8; font-weight: 600;">Avg Order Value</h3>
                        <p id="stat-aov" style="font-size: 32px; font-weight: bold; margin: 0;">RWF 0</p>
                        <i class="ph-fill ph-receipt" style="position: absolute; right: 15px; top: 15px; font-size: 60px; opacity: 0.15; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </div>
                    <a href="#" style="display: block; background: rgba(0,0,0,0.2); padding: 8px 15px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 13px; text-align: center; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                        View Detail <i class="ph ph-arrow-circle-right" style="vertical-align: middle; margin-left: 5px;"></i>
                    </a>
                </div>

                <!-- Card 4: Total Users (#E0C097) -->
                <div style="background-color: #E0C097; border-radius: 6px; overflow: hidden; position: relative; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="padding: 20px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; opacity: 0.8; font-weight: 600; color: rgba(0,0,0,0.6);">Total Users</h3>
                        <p style="font-size: 32px; font-weight: bold; margin: 0; color: #111;"><span id="stat-users">0</span> <span id="stat-new-users" style="font-size: 16px; color: #1e702e; font-weight: bold; margin-left: 5px;">(+0)</span></p>
                        <i class="ph-fill ph-users" style="position: absolute; right: 15px; top: 15px; font-size: 60px; color: #000; opacity: 0.1; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </div>
                    <a href="#" style="display: block; background: rgba(0,0,0,0.1); padding: 8px 15px; color: rgba(0,0,0,0.7); text-decoration: none; font-size: 13px; text-align: center; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.15)'" onmouseout="this.style.background='rgba(0,0,0,0.1)'">
                        View Detail <i class="ph ph-arrow-circle-right" style="vertical-align: middle; margin-left: 5px;"></i>
                    </a>
                </div>

            </div>

            <div class="card glass" style="padding: 20px;">
                <div class="card-header pb-0" style="margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1A3B47; font-family: "Magra", sans-serif;">Analytics Details</h3>
                </div>
                <div class="card-body">
                    <ul class="nav nav-pills" id="analytics-pills-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="pills-orders-tab" data-target="pills-orders" role="tab" aria-selected="true">
                                Orders Over Time
                                <span class="pill-badge" id="badge-orders">0</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-revenue-tab" data-target="pills-revenue" role="tab" aria-selected="false">
                                Revenue Over Time
                                <span class="pill-badge" id="badge-revenue">0</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-items-tab" data-target="pills-items" role="tab" aria-selected="false">
                                Top Selling Items
                                <span class="pill-badge" id="badge-items">0</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-category-tab" data-target="pills-category" role="tab" aria-selected="false">
                                Sales by Category
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-hours-tab" data-target="pills-hours" role="tab" aria-selected="false">
                                Peak Hours
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-retention-tab" data-target="pills-retention" role="tab" aria-selected="false">
                                Customer Retention
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-status-tab" data-target="pills-status" role="tab" aria-selected="false">
                                Order Status
                            </a>
                        </li>
                    </ul>
                    <div class="tab-content" id="analytics-pills-tabContent" style="margin-top: 20px;">
                        <div class="tab-pane fade show active" id="pills-orders" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%;">
                                <canvas id="ordersChart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-revenue" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%;">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-items" role="tabpanel">
                            <ul id="top-items-list" style="list-style: none; padding: 0; margin: 0;">
                                <!-- populated by JS -->
                            </ul>
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ccc;">
                                <h3 style="margin: 0 0 5px 0; color: #8c9ea6; font-size: 14px; text-transform: uppercase;">Most Popular Category</h3>
                                <p id="stat-popular-cat" style="font-size: 20px; font-weight: bold; text-transform: capitalize; color: #c42d2d; margin: 0;">None</p>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-category" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%; display: flex; justify-content: center;">
                                <canvas id="categoryChart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-hours" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%;">
                                <canvas id="hoursChart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-retention" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%; display: flex; justify-content: center;">
                                <canvas id="retentionChart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-status" role="tabpanel">
                            <div style="position: relative; height: 300px; width: 100%; display: flex; justify-content: center;">
                                <canvas id="statusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="section-staff" class="admin-section" style="display: none;">
            <header class="dashboard-header" style="border-bottom: none; padding-bottom: 0;">
                <div class="dashboard-title-area">
                    <h2>Staff Management</h2>
                    <div class="dashboard-stats">
                        <span class="stat-text">Manage staff accounts and permissions</span>
                    </div>
                </div>
                <div class="dashboard-actions">
                    <button id="add-staff-btn" class="btn btn-manage-light" style="padding: 8px 16px;">+ Add Staff</button>
                </div>
            </header>
            <div class="table-responsive">
                <table id="staffTable" class="display" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="staff-table-body">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
        <?php endif; ?>

    </div>
    
    <!-- Toast Notification Container -->
    <div id="admin-modal" class="modal-overlay hidden">
        <div class="modal-content glass admin-modal-content">
            <h2 id="admin-modal-title">Add New Item</h2>
            <form id="admin-form" enctype="multipart/form-data">
                <input type="hidden" id="item-id">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="item-name" required class="form-input">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="item-category" required class="form-input">
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                        <option value="burgers">Burgers</option>
                        <option value="sandwiches">Sandwiches</option>
                        <option value="pizza">Pizza</option>
                        <option value="omelettes">Omelettes</option>
                        <option value="sides">Sides</option>
                        <option value="extras">Extras</option>
                        <option value="smoothies">Smoothies</option>
                        <option value="shots">Shots</option>
                        <option value="shakes">Shakes</option>
                        <option value="iced">Iced Drinks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pricing Option</label>
                    <div style="display: flex; gap: 20px; margin-top: 8px; margin-bottom: 8px;">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; cursor: pointer; color: var(--text-color);">
                            <input type="radio" name="price-type" id="price-type-free" value="free" style="accent-color: var(--brand-red);"> Free Extra
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; cursor: pointer; color: var(--text-color);">
                            <input type="radio" name="price-type" id="price-type-paid" value="paid" checked style="accent-color: var(--brand-red);"> Paid / Set Price
                        </label>
                    </div>
                </div>
                <div class="form-group" id="price-input-container">
                    <label>Price (RWF)</label>
                    <input type="number" id="item-price" required class="form-input" min="0" placeholder="e.g. 500">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="item-desc" rows="3" required class="form-input"></textarea>
                </div>
                <div class="form-group">
                    <label>Image Upload</label>
                    <input type="file" id="item-image" accept="image/*" class="form-input">
                    <div style="margin-top: 10px;">
                        <img id="image-preview" src="" alt="Preview" style="max-width: 100px; max-height: 100px; display: none; border-radius: 4px;">
                        <span id="current-image-path" style="display: none; font-size: 0.85em; color: #aaa; margin-left: 10px;"></span>
                    </div>
                </div>
                <div class="admin-modal-footer" style="display: flex; justify-content: space-between; width: 100%;">
                    <div>
                        <button type="button" class="btn" style="background: #ff4d4f; color: white; display: none;" id="admin-delete-btn">Delete</button>
                    </div>
                    <div>
                        <button type="button" class="btn btn-secondary" id="admin-close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div id="admin-user-modal" class="modal-overlay hidden">
        <div class="modal-content glass admin-modal-content">
            <h2>Manage User</h2>
            <form id="admin-user-form" enctype="multipart/form-data">
                <input type="hidden" id="user-id">
                
                <div class="user-modal-flex">
                    <div style="flex-shrink: 0; text-align: center;">
                        <img id="user-image-preview" src="" alt="Profile Image" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid #e1e3e5; display: none;">
                        <div style="margin-top: 10px;">
                            <label for="user-image" class="btn btn-default btn-xs" style="cursor: pointer; display: inline-block;">Change Photo</label>
                            <input type="file" id="user-image" accept="image/*" style="display: none;">
                        </div>
                    </div>
                    
                    <div style="flex-grow: 1;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="user-fullname" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="user-email" required class="form-input">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="user-phone" class="form-input">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea id="user-address" class="form-input" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="user-role" class="form-input">
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div class="admin-modal-footer" style="display: flex; justify-content: space-between; width: 100%; margin-top: 20px;">
                    <div>
                        <button type="button" class="btn" style="background: #ff4d4f; color: white;" id="user-delete-btn">Delete</button>
                    </div>
                    <div>
                        <button type="button" class="btn btn-secondary" id="user-close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <!-- Modal for Item Info -->
    <div id="item-info-modal" class="modal-overlay hidden" style="z-index: 10000;">
        <div class="modal-content glass" style="max-width: 400px; padding: 20px;">
            <h3 id="item-info-title" style="margin-top: 0; color: #1A3B47;">Item Name</h3>
            <img id="item-info-image" src="" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; display: none;">
            <p id="item-info-description" style="color: #555; font-size: 14px; margin-bottom: 25px;">Description goes here...</p>
            <div style="display: flex; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('item-info-modal').classList.add('hidden')">Close</button>
            </div>
        </div>
    </div>

    <!-- Modal for Confirm Actions -->
    <div id="confirm-modal" class="modal-overlay hidden" style="z-index: 10000;">
        <div class="modal-content glass" style="max-width: 400px; text-align: center; padding: 30px;">
            <h3 id="confirm-modal-title" style="margin-top: 0; color: #1A3B47;">Confirm Action</h3>
            <p id="confirm-modal-message" style="color: #555; margin-bottom: 25px;">Are you sure you want to proceed?</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
                <button type="button" class="btn btn-secondary" id="confirm-modal-cancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirm-modal-ok" style="background: #007bff; border-color: #007bff;">OK</button>
            </div>
        </div>
    </div>

    <!-- Add Staff Modal -->
    <div id="add-staff-modal" class="modal-overlay hidden" style="z-index: 10000;">
        <div class="modal-content glass" style="max-width: 400px; padding: 30px;">
            <h3 style="margin-top: 0; color: #1A3B47; margin-bottom: 20px;">Add New Staff</h3>
            <form id="add-staff-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="staff-email" required class="form-input">
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="staff-name" required class="form-input">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="staff-password" required class="form-input">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('add-staff-modal').classList.add('hidden')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Staff</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Coupon Modal -->
    <div id="admin-coupon-modal" class="modal-overlay hidden">
        <div class="modal-content glass admin-modal-content" style="max-width: 450px;">
            <h2 id="coupon-modal-title">Manage Coupon</h2>
            <form id="coupon-form">
                <input type="hidden" id="coupon-id">
                
                <div class="form-group">
                    <label>Coupon Code</label>
                    <input type="text" id="coupon-code" required class="form-input" placeholder="e.g. WELCOME10" style="text-transform: uppercase;">
                </div>
                
                <div class="form-group">
                    <label>Discount Type</label>
                    <select id="coupon-type" required class="form-input">
                        <option value="percent">Percentage Off (%)</option>
                        <option value="flat">Flat Amount Off (RWF)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Discount Value</label>
                    <input type="number" id="coupon-value" required class="form-input" min="1" placeholder="e.g. 10 for percentage, or 1000 for flat">
                </div>
                
                <div class="form-group">
                    <label>Minimum Order Amount (RWF)</label>
                    <input type="number" id="coupon-min-order" required class="form-input" min="0" value="0" placeholder="e.g. 5000">
                </div>

                <div class="form-group">
                    <label>Status</label>
                    <select id="coupon-active" required class="form-input">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                <div class="admin-modal-footer" style="display: flex; justify-content: space-between; width: 100%; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" id="coupon-close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>

    <script>
        const IS_ADMIN = <?= $isAdmin ? 'true' : 'false' ?>;
    </script>
    <script src="admin.js?v=<?= time() ?>"></script>
</body>
</html>
