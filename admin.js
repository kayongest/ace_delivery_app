document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'api/menu.php';
    
    // Toast Notification System
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'glass';
        const color = type === 'success' ? '#28a745' : '#c42d2d';
        toast.style.cssText = `
            padding: 15px 20px;
            border-left: 4px solid ${color};
            background: white;
            color: #111;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
        `;
        toast.innerHTML = `<i class="ph ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}" style="color: ${color}; font-size: 20px;"></i> ${message}`;
        
        container.appendChild(toast);
        
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
    let menuData = [];
    let filteredMenuData = [];

    const tableBody = document.getElementById('admin-menu-list');
    const modal = document.getElementById('admin-modal');
    const form = document.getElementById('admin-form');
    const addBtn = document.getElementById('add-new-btn');
    const closeBtn = document.getElementById('admin-close-modal');
    const modalTitle = document.getElementById('admin-modal-title');

    // Fetch data from API
    async function fetchMenu() {
        const grid = document.getElementById('admin-menu-list');
        if (grid) grid.innerHTML = Array(6).fill('<div class="skeleton skeleton-card" style="height: 250px;"></div>').join('');
        try {
            const response = await fetch(`${apiEndpoint}?_t=${new Date().getTime()}`);
            
            // Artificial delay for local testing so skeleton loaders are visible
            await new Promise(r => setTimeout(r, 600));
            
            if (response.ok) {
                menuData = await response.json();
                filteredMenuData = [...menuData];
                renderGrid();
            } else {
                console.error('Failed to fetch menu');
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    }

    // Update stats
    function updateStats() {
        const countLabel = document.getElementById('item-count-label');
        if(countLabel) {
            countLabel.textContent = `${filteredMenuData.length} Items`;
        }
    }

    // Render Grid
    let currentAdminMenuPage = 1;
    const ADMIN_ITEMS_PER_PAGE = 6;

    function renderGrid(page = 1) {
        if (!tableBody) return;
        updateStats();
        tableBody.innerHTML = '';
        
        currentAdminMenuPage = page;
        const totalPages = Math.ceil(filteredMenuData.length / ADMIN_ITEMS_PER_PAGE);
        
        if (currentAdminMenuPage > totalPages) currentAdminMenuPage = totalPages;
        if (currentAdminMenuPage < 1) currentAdminMenuPage = 1;
        
        const startIndex = (currentAdminMenuPage - 1) * ADMIN_ITEMS_PER_PAGE;
        const endIndex = startIndex + ADMIN_ITEMS_PER_PAGE;
        const pageItems = filteredMenuData.slice(startIndex, endIndex);

        pageItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dealer-card';
            
            // Generate initials or fallback image if needed, though they should have images
            const imgSrc = item.image ? item.image : "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23E3F0EE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%231A3B47%22%20font-family%3D%22Arial%22%20font-size%3D%2214px%22%3ENo Img%3C%2Ftext%3E%3C%2Fsvg%3E";

            card.innerHTML = `
                <div class="dealer-img-container">
                    <img src="${imgSrc}" alt="${item.name}" class="dealer-img">
                </div>
                <h3 class="dealer-name">${item.name}</h3>
                <p class="dealer-location" style="text-transform: capitalize;">${item.category}</p>
                <button class="btn-view-more" onclick="editItem(${item.id})">Manage</button>
            `;
            tableBody.appendChild(card);
        });

        renderPagination(totalPages);
    }
    
    // Live Search for Menu
    const menuSearchInput = document.getElementById('menu-search-input');
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            filteredMenuData = menuData.filter(item => {
                const nameMatch = item.name && item.name.toLowerCase().includes(term);
                const categoryMatch = item.category && item.category.toLowerCase().includes(term);
                return nameMatch || categoryMatch;
            });
            renderGrid(1); // Re-render grid starting at page 1
        });
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('admin-menu-pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= totalPages; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'pagination-dot' + (i === currentAdminMenuPage ? ' active' : '');
                    dot.style.cssText = 'width: 10px; height: 10px; border-radius: 50%; background-color: ' + (i === currentAdminMenuPage ? '#007bff' : '#d1d5db') + '; display: inline-block; cursor: pointer; transition: background-color 0.2s;';
                    dot.onclick = () => {
                        renderGrid(i);
                        document.getElementById('section-menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
                    };
                    paginationContainer.appendChild(dot);
                }
            }
        }
    }

    // Open Modal
    function openModal(isEdit = false, item = null) {
        modal.classList.remove('hidden');
        const deleteBtn = document.getElementById('admin-delete-btn');
        if (isEdit && item) {
            modalTitle.textContent = 'Edit Item';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-desc').value = item.description;
            document.getElementById('item-image').value = ''; // clear file input
            document.getElementById('image-preview').src = item.image || '';
            document.getElementById('image-preview').style.display = item.image ? 'block' : 'none';
            document.getElementById('current-image-path').textContent = item.image ? 'Current: ' + item.image : '';
            document.getElementById('current-image-path').style.display = item.image ? 'inline' : 'none';
            
            if(deleteBtn) {
                deleteBtn.style.display = 'inline-block';
                deleteBtn.onclick = () => {
                    deleteItem(item.id);
                    closeModal();
                };
            }
        } else {
            modalTitle.textContent = 'Add New Item';
            form.reset();
            document.getElementById('item-id').value = '';
            document.getElementById('image-preview').style.display = 'none';
            document.getElementById('current-image-path').style.display = 'none';
            if(deleteBtn) deleteBtn.style.display = 'none';
        }
    }

    // Close Modal
    function closeModal() {
        if(modal) modal.classList.add('hidden');
    }

    if(addBtn) addBtn.addEventListener('click', () => openModal(false));
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    // Form Submission
    if(form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('item-id').value;
        const formData = new FormData();
        
        formData.append('name', document.getElementById('item-name').value);
        formData.append('category', document.getElementById('item-category').value);
        formData.append('price', document.getElementById('item-price').value);
        formData.append('description', document.getElementById('item-desc').value);
        
        const imageFile = document.getElementById('item-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (id) {
            formData.append('id', id);
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST', // We use POST for both create and update with FormData
                body: formData
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast(id ? 'Item updated successfully!' : 'Item added successfully!');
                closeModal();
                fetchMenu(); // Refresh the list
            } else {
                showToast('Error saving item: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error connecting to the server.');
        }
    });

    // Edit Item
    window.editItem = function(id) {
        const item = menuData.find(i => i.id == id);
        if (item) {
            openModal(true, item);
        }
    };

    // Delete Item
    window.deleteItem = async function(id) {
        const confirmed = await window.customConfirm('Are you sure you want to delete this item?');
        if (confirmed) {
            try {
                const response = await fetch(`${apiEndpoint}?id=${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    showToast('Item deleted successfully!');
                    fetchMenu(); // Refresh the list
                } else {
                    showToast('Error deleting item: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error connecting to the server.');
            }
        }
    };

    // Initial Fetch
    if (tableBody) fetchMenu();

    // If Staff, default tab is Orders, so fetch immediately
    if (typeof IS_ADMIN !== 'undefined' && !IS_ADMIN) {
        // The fetchOrders function might be defined slightly lower down, 
        // we can safely call it if we wait a tick or just rely on hoisting if it were a function declaration.
        // Wait, it's defined as `async function fetchOrders()`, so hoisting makes it available here!
        fetchOrders();
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const sections = document.querySelectorAll('.admin-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = '#8c9ea6';
                b.style.borderBottomColor = 'transparent';
            });
            
            btn.classList.add('active');
            btn.style.color = '#1A3B47';
            btn.style.borderBottomColor = '#1A3B47';
            
            const target = btn.getAttribute('data-target');
            sections.forEach(sec => {
                if(sec.id === target) {
                    sec.style.display = 'block';
                    if(target === 'section-orders') fetchOrders();
                    if(target === 'section-users') fetchUsers();
                    if(target === 'section-staff' && typeof fetchStaff === 'function') fetchStaff();
                    if(target === 'section-reviews') fetchAdminReviews();
                    if(target === 'section-analytics') {
                        const filterVal = document.getElementById('analytics-date-filter').value;
                        fetchAnalytics(filterVal);
                    }
                } else {
                    sec.style.display = 'none';
                }
            });
        });
    });

    // Analytics Pill Tabs logic
    const pillTabs = document.querySelectorAll('#analytics-pills-tab .nav-link');
    pillTabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            pillTabs.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            document.querySelectorAll('#analytics-pills-tabContent .tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            const targetId = this.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
            
            // Resize charts if they are in the newly shown pane
            if (targetId === 'pills-orders' && ordersChartInstance) {
                ordersChartInstance.resize();
            } else if (targetId === 'pills-revenue' && revenueChartInstance) {
                revenueChartInstance.resize();
            } else if (targetId === 'pills-category' && categoryChartInstance) {
                categoryChartInstance.resize();
            } else if (targetId === 'pills-hours' && hoursChartInstance) {
                hoursChartInstance.resize();
            } else if (targetId === 'pills-retention' && retentionChartInstance) {
                retentionChartInstance.resize();
            } else if (targetId === 'pills-status' && statusChartInstance) {
                statusChartInstance.resize();
            }
        });
    });

    let ordersData = [];
    let ordersTableInstance = null;

    // Set up filter function globally
    window.filterOrders = function(button, filter) {
        document.querySelectorAll('.order-filter-btn').forEach(b => {
            b.style.borderBottomColor = 'transparent';
            b.style.color = '#8c9ea6';
            b.style.fontWeight = '500';
            b.classList.remove('active');
        });
        button.style.borderBottomColor = '#007bff';
        button.style.color = '#111';
        button.style.fontWeight = '600';
        button.classList.add('active');
        
        if (ordersTableInstance) {
            // Reset both columns (Payment is now 4, Fulfillment is now 5)
            ordersTableInstance.column(4).search('');
            ordersTableInstance.column(5).search('');
            
            if (filter === 'paid') {
                ordersTableInstance.column(4).search('Paid');
            } else if (filter === 'unpaid') {
                ordersTableInstance.column(4).search('Pending');
            } else if (filter === 'pending') {
                ordersTableInstance.column(5).search('Pending');
            } else if (filter === 'delivered') {
                ordersTableInstance.column(5).search('Delivered');
            } else if (filter === 'cancelled') {
                ordersTableInstance.column(5).search('Cancelled');
            }
            ordersTableInstance.draw();
        }
    };

    async function fetchOrders() {
        try {
            const response = await fetch(`api/orders.php?_t=${Date.now()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    ordersData = result.data;
                    window.allOrders = ordersData;
                    renderOrders();
                }
            }
        } catch (e) {
            console.error('Failed to fetch orders:', e);
        }
    }

    function renderOrders() {
        if ($.fn.DataTable.isDataTable('#ordersTable')) {
            $('#ordersTable').DataTable().destroy();
        }
        
        const ordersList = document.getElementById('admin-orders-list');
        const orderCountLabel = document.getElementById('order-count-label');
        
        if (orderCountLabel) {
            orderCountLabel.innerText = `${ordersData.length} Orders`;
        }
        
        if (!ordersList) return;
        ordersList.innerHTML = '';
        
        ordersData.forEach(order => {
            const tr = document.createElement('tr');
            
            const itemsHtml = order.items.map(i => {
                const safeName = i.item_name ? i.item_name.replace(/'/g, "\\'").replace(/"/g, "&quot;") : '';
                const safeDesc = i.item_description ? i.item_description.replace(/'/g, "\\'").replace(/"/g, "&quot;") : '';
                const safeImg = i.item_image ? i.item_image.replace(/'/g, "\\'").replace(/"/g, "&quot;") : '';
                return `<a href="#" onclick="viewItemInfo('${safeName}', '${safeDesc}', '${safeImg}')" style="display: inline-block; padding: 4px 10px; margin: 2px; border-radius: 12px; background-color: #E8F1EF; color: #1A3B47; border: 1px solid #c8d9d5; text-decoration: none; font-weight: 600; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#1A3B47'; this.style.color='#fff';" onmouseout="this.style.backgroundColor='#E8F1EF'; this.style.color='#1A3B47';">${i.quantity}x ${i.item_name}</a>`;
            }).join(' ');
            const date = new Date(order.created_at).toLocaleString();
            
            let paymentBadge = '';
            if(order.payment_status === 'pending') {
                paymentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #f58852; color: #fff; border: 1px solid #d47647; font-size: 12px; font-weight: 500;">Pending</span>';
            } else {
                paymentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #b7e6cd; color: #000; border: 1px solid #9ad9b5; font-size: 12px; font-weight: 500;">Paid</span>';
            }

            let fulfillmentBadge = '';
            if(order.status === 'pending') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #f58852; color: #fff; border: 1px solid #d47647; font-size: 12px; font-weight: 500;">Pending</span>';
            } else if(order.status === 'preparing') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #295cf0; color: #fff; border: 1px solid #1c4bc2; font-size: 12px; font-weight: 500;">Preparing</span>';
            } else if(order.status === 'complete_awaiting_pickup' || order.status === 'out_for_delivery') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #1E3E62; color: #fff; border: 1px solid #162f4a; font-size: 12px; font-weight: 500;">Ready</span>';
            } else if(order.status === 'delivered') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #488f73; color: #fff; border: 1px solid #367059; font-size: 12px; font-weight: 500;">Delivered</span>';
            } else if(order.status === 'cancelled') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #d41a1a; color: #fff; border: 1px solid #a81515; font-size: 12px; font-weight: 500;">Cancelled</span>';
            }

            const totalItems = order.items.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
            const deliveryMethod = 'Local pickup'; // Or derive from order if available

            tr.innerHTML = `
                <td data-sort="${order.id}"><a href="#" onclick="viewOrderDetails(${order.id})" style="color: #007bff; text-decoration: none; font-weight: 600;">#${order.id}</a></td>
                <td data-sort="${new Date(order.created_at).getTime()}" style="color: #555;">${date}</td>
                <td><strong>${order.customer_name}</strong></td>
                <td>RWF ${order.total_amount}</td>
                <td>${paymentBadge}</td>
                <td>${fulfillmentBadge}</td>
                <td>${itemsHtml}</td>
                <td style="color: #555;">${deliveryMethod}</td>
                <td style="text-align: right;">
                    <div style="position: relative; display: inline-block;">
                        <button type="button" onclick="this.nextElementSibling.style.display = 'block'; this.nextElementSibling.nextElementSibling.style.display = 'block'" style="background: #455f79; border: 1px solid #455f79; border-radius: 4px; cursor: pointer; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #ffffff;">
                            Actions
                        </button>
                        <div style="display: none; position: fixed; inset: 0; z-index: 999;" onclick="this.style.display='none'; this.nextElementSibling.style.display='none'"></div>
                        <div class="action-dropdown-menu" style="display: none; position: absolute; top: 100%; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 6px; width: 260px; z-index: 1000; text-align: left; border: 1px solid #eee; padding: 12px; margin-top: 5px;">
                            
                            <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Payment</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                                <a href="#" onclick="updateOrderPayment(${order.id}, 'paid')" style="padding: 4px 8px; font-size: 11px; background: #b7e6cd; color: #000; border: 1px solid #9ad9b5; border-radius: 4px; text-decoration: none;">Paid</a>
                                <a href="#" onclick="updateOrderPayment(${order.id}, 'pending')" style="padding: 4px 8px; font-size: 11px; background: #f58852; color: #fff; border: 1px solid #d47647; border-radius: 4px; text-decoration: none;">Pending</a>
                            </div>

                            <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Fulfillment</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'pending')" style="padding: 4px 8px; font-size: 11px; background: #f58852; color: #fff; border: 1px solid #d47647; border-radius: 4px; text-decoration: none;">Pending</a>
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'preparing')" style="padding: 4px 8px; font-size: 11px; background: #295cf0; color: #fff; border: 1px solid #1c4bc2; border-radius: 4px; text-decoration: none;">Preparing</a>
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'complete_awaiting_pickup')" style="padding: 4px 8px; font-size: 11px; background: #1E3E62; color: #fff; border: 1px solid #162f4a; border-radius: 4px; text-decoration: none;">Ready</a>
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'delivered')" style="padding: 4px 8px; font-size: 11px; background: #488f73; color: #fff; border: 1px solid #367059; border-radius: 4px; text-decoration: none;">Delivered</a>
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'cancelled')" style="padding: 4px 8px; font-size: 11px; background: #d41a1a; color: #fff; border: 1px solid #a81515; border-radius: 4px; text-decoration: none;">Cancelled</a>
                            </div>
                            
                            <div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 12px;">
                                <a href="receipt.php?id=${order.id}" target="_blank" style="display: block; text-align: center; padding: 6px 8px; font-size: 11px; background: #f8f9fa; color: #333; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; font-weight: 500;">Print Receipt</a>
                            </div>
                        </div>
                    </div>
                </td>
            `;
            ordersList.appendChild(tr);
        });
        
        // Initialize Standard DataTable
        ordersTableInstance = $('#ordersTable').DataTable({
            responsive: true,
            order: [[0, 'desc']],
            pagingType: 'simple_numbers',
            language: {
                search: "Search:",
                paginate: {
                    previous: '<span style="font-weight: 700; font-family: monospace; font-size: 14px; margin-right: 2px;">&lt;</span>',
                    next: '<span style="font-weight: 700; font-family: monospace; font-size: 14px;">&gt;</span>'
                }
            },
            lengthMenu: [5, 10, 25, 50],
            pageLength: 5
        });
    }

    window.customConfirm = function(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const messageEl = document.getElementById('confirm-modal-message');
            const okBtn = document.getElementById('confirm-modal-ok');
            const cancelBtn = document.getElementById('confirm-modal-cancel');
            
            if (!modal) {
                // Fallback to native confirm if modal isn't found
                resolve(confirm(message));
                return;
            }
            
            messageEl.textContent = message;
            modal.classList.remove('hidden');
            
            const cleanup = () => {
                modal.classList.add('hidden');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
            };
            
            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            
            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
        });
    };

    window.updateOrderStatus = async function(orderId, newStatus) {
        let statusText = newStatus;
        if(newStatus === 'complete_awaiting_pickup') statusText = 'complete (awaiting pickup)';
        const confirmed = await window.customConfirm('Are you sure you want to change the status to ' + statusText.replace(/_/g, ' ') + '?');
        if(!confirmed) return;
        
        try {
            const response = await fetch('api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: newStatus })
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast('Order status updated!');
                fetchOrders(); // Refresh
            } else {
                showToast('Failed to update status: ' + result.message, 'error');
            }
        } catch (e) {
            console.error(e);
            alert('Error communicating with server.');
        }
    }

    window.updateOrderPayment = async function(orderId, newPaymentStatus) {
        const confirmed = await window.customConfirm('Are you sure you want to mark this payment as ' + newPaymentStatus + '?');
        if(!confirmed) return;
        
        try {
            const response = await fetch('api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, payment_status: newPaymentStatus })
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast('Payment status updated!');
                fetchOrders(); // Refresh
            } else {
                showToast('Failed to update payment status: ' + result.message, 'error');
            }
        } catch (e) {
            console.error(e);
            alert('Error communicating with server.');
        }
    }

    // Analytics Logic
    let revenueChartInstance = null;
    let ordersChartInstance = null;
    let categoryChartInstance = null;
    let hoursChartInstance = null;
    let retentionChartInstance = null;
    let statusChartInstance = null;

    const dateFilter = document.getElementById('analytics-date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            fetchAnalytics(e.target.value);
        });
    }

    async function fetchAnalytics(range) {
        try {
            const response = await fetch(`api/analytics.php?range=${range}&_t=${Date.now()}`);
            const result = await response.json();
            
            if (result.status === 'success') {
                renderAnalytics(result);
            } else {
                console.error('Analytics Error:', result.message);
            }
        } catch (e) {
            console.error('Failed to fetch analytics:', e);
        }
    }

    function renderAnalytics(data) {
        // 1. KPI Cards
        document.getElementById('stat-revenue').innerText = `RWF ${data.metrics.total_revenue.toLocaleString()}`;
        document.getElementById('stat-orders').innerText = data.metrics.total_orders.toLocaleString();
        document.getElementById('stat-aov').innerText = `RWF ${data.metrics.average_order_value.toLocaleString()}`;
        document.getElementById('stat-users').innerHTML = `${data.metrics.total_users.toLocaleString()} <span id="stat-new-users" style="font-size: 14px; color: #28a745; font-weight: normal;">(+${data.metrics.new_users})</span>`;
        document.getElementById('stat-popular-cat').innerText = data.metrics.popular_category || 'None';

        // Update Pill Tab Badges
        const totalRev = data.metrics.total_revenue;
        document.getElementById('badge-orders').innerText = data.metrics.total_orders.toLocaleString();
        document.getElementById('badge-revenue').innerText = totalRev >= 1000 ? (totalRev/1000).toFixed(1) + 'k' : totalRev;
        document.getElementById('badge-items').innerText = data.top_items ? data.top_items.length : 0;
        // 2. Top Items
        const topList = document.getElementById('top-items-list');
        topList.innerHTML = '';
        if (data.top_items && data.top_items.length > 0) {
            data.top_items.forEach((item, index) => {
                topList.innerHTML += `
                    <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span style="color: #1A3B47;"><strong>#${index+1}</strong> ${item.name}</span>
                        <span style="color: #8c9ea6;">${item.qty} sold</span>
                    </li>
                `;
            });
        } else {
            topList.innerHTML = '<li style="color: #8c9ea6;">No data for this period.</li>';
        }

        // 3. Charts Data Prep
        const labels = data.chart_data.map(row => row.date);
        const revenueData = data.chart_data.map(row => parseFloat(row.revenue));
        // We'll calculate orders per day (we don't have order count per day in the API currently, wait...
        // Ah, the API query `SUM(total_amount) as revenue`. Let's assume the API didn't return count.
        // I will just use revenue data for both as a placeholder if count isn't there, or I can update the API.
        // I should update the API to return `COUNT(id) as orders` too. Let's do that in a sec.
        const ordersData = data.chart_data.map(row => parseInt(row.orders) || 0);

        // Render Revenue Line Chart
        const ctxRev = document.getElementById('revenueChart').getContext('2d');
        const existingRevChart = Chart.getChart("revenueChart");
        if (existingRevChart) existingRevChart.destroy();
        
        revenueChartInstance = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (RWF)',
                    data: revenueData,
                    borderColor: '#1A3B47',
                    backgroundColor: 'rgba(26, 59, 71, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, // smooth curves
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: (val) => 'RWF ' + val } }
                }
            }
        });

        // Render Orders Bar Chart
        const ctxOrd = document.getElementById('ordersChart').getContext('2d');
        const existingOrdersChart = Chart.getChart("ordersChart");
        if (existingOrdersChart) existingOrdersChart.destroy();
        
        ordersChartInstance = new Chart(ctxOrd, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: ordersData,
                    backgroundColor: '#c42d2d',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        // Render Category Doughnut Chart
        const ctxCat = document.getElementById('categoryChart').getContext('2d');
        const existingCatChart = Chart.getChart("categoryChart");
        if (existingCatChart) existingCatChart.destroy();
        const catLabels = data.category_sales ? data.category_sales.map(row => row.category || 'Unknown') : [];
        const catData = data.category_sales ? data.category_sales.map(row => parseFloat(row.revenue)) : [];
        categoryChartInstance = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catData,
                    backgroundColor: ['#1A3B47', '#c42d2d', '#E0C097', '#5C3D2E', '#8c9ea6', '#2D2424'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });

        // Render Peak Hours Chart
        const ctxHours = document.getElementById('hoursChart').getContext('2d');
        const existingHoursChart = Chart.getChart("hoursChart");
        if (existingHoursChart) existingHoursChart.destroy();
        const hourLabels = data.peak_hours ? data.peak_hours.map(row => row.hour + ':00') : [];
        const hourData = data.peak_hours ? data.peak_hours.map(row => parseInt(row.orders)) : [];
        hoursChartInstance = new Chart(ctxHours, {
            type: 'bar',
            data: {
                labels: hourLabels,
                datasets: [{
                    label: 'Orders',
                    data: hourData,
                    backgroundColor: '#1A3B47',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });

        // Render Retention Chart
        const ctxRet = document.getElementById('retentionChart').getContext('2d');
        const existingRetChart = Chart.getChart("retentionChart");
        if (existingRetChart) existingRetChart.destroy();
        const retLabels = data.retention ? data.retention.map(row => row.type) : [];
        const retData = data.retention ? data.retention.map(row => parseInt(row.count)) : [];
        retentionChartInstance = new Chart(ctxRet, {
            type: 'pie',
            data: {
                labels: retLabels,
                datasets: [{
                    data: retData,
                    backgroundColor: ['#c42d2d', '#8c9ea6'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });

        // Render Status Chart
        const ctxStatus = document.getElementById('statusChart').getContext('2d');
        const existingStatusChart = Chart.getChart("statusChart");
        if (existingStatusChart) existingStatusChart.destroy();
        const baseStatuses = {
            'Pending': 0,
            'Preparing': 0,
            'Ready': 0,
            'Delivered': 0,
            'Cancelled': 0
        };

        if (data.order_status) {
            data.order_status.forEach(row => {
                let label = row.status === 'complete_awaiting_pickup' ? 'Ready' : (row.status.charAt(0).toUpperCase() + row.status.slice(1));
                if (baseStatuses[label] !== undefined) {
                    baseStatuses[label] = parseInt(row.count);
                } else {
                    baseStatuses[label] = parseInt(row.count);
                }
            });
        }

        const statLabels = Object.keys(baseStatuses);
        const statData = Object.values(baseStatuses);
        
        const colorMap = {
            'Pending': '#f58852',
            'Cancelled': '#f60019',
            'Ready': '#1e3e62',
            'Delivered': '#488f73',
            'Preparing': '#8A6F5A'
        };
        const statColors = statLabels.map(label => colorMap[label] || '#999999');

        statusChartInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: statLabels,
                datasets: [{
                    data: statData,
                    backgroundColor: statColors,
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }

    // --- Users Management ---
    let usersTableInstance = null;
    window.adminUsersData = [];
    
    async function fetchUsers() {
        try {
            const response = await fetch(`api/admin_users.php?_t=${Date.now()}`);
            const result = await response.json();
            if(result.status === 'success') {
                window.adminUsersData = result.data;
                renderUsers(window.adminUsersData);
            } else {
                showToast('Failed to load users', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error loading users', 'error');
        }
    }
    
    function renderUsers(users) {
        const grid = document.getElementById('admin-users-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        users.forEach(u => {
            const displayName = u.full_name || u.email;
            let avatarHtml = `<div class="user-avatar">No Img</div>`;
            if (u.profile_image) {
                avatarHtml = `<img src="${u.profile_image}" class="user-avatar" alt="${displayName}">`;
            } else {
                // Generate initials if no image
                const initials = displayName.substring(0, 2).toUpperCase();
                avatarHtml = `<div class="user-avatar">${initials}</div>`;
            }

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                ${avatarHtml}
                <div class="user-name">${displayName}</div>
                <button class="btn-manage-user" onclick="editUser(${u.id})">Manage</button>
            `;
            grid.appendChild(card);
        });
    }

    // Search Users
    const userSearchInput = document.getElementById('user-search-input');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            if (!window.adminUsersData) return;
            const filtered = window.adminUsersData.filter(u => {
                const nameMatch = (u.full_name || '').toLowerCase().includes(term);
                const emailMatch = (u.email || '').toLowerCase().includes(term);
                return nameMatch || emailMatch;
            });
            renderUsers(filtered);
        });
    }
    
    window.deleteUser = async function(id) {
        const confirmed = await window.customConfirm('Are you sure you want to delete this user? This action cannot be undone.');
        if(!confirmed) return;
        
        try {
            const response = await fetch('api/admin_users.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await response.json();
            if(result.status === 'success') {
                showToast('User deleted successfully');
                document.getElementById('admin-user-modal').classList.add('hidden');
                fetchUsers();
            } else {
                showToast(result.message || 'Failed to delete user', 'error');
            }
        } catch(e) {
            console.error(e);
            showToast('Error deleting user', 'error');
        }
    }


    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            document.getElementById('manage-user-modal-title').textContent = 'Add New User';
            document.getElementById('manage-user-id').value = '0';
            document.getElementById('manage-user-name').value = '';
            document.getElementById('manage-user-email').value = '';
            document.getElementById('manage-user-email').readOnly = false;
            document.getElementById('manage-user-password').value = '';
            document.getElementById('manage-user-phone').value = '';
            document.getElementById('manage-user-address').value = '';
            document.getElementById('manage-user-role').value = 'customer';
            
            document.getElementById('user-avatar-preview').innerHTML = 'No Img';
            document.getElementById('user-avatar-upload').value = '';
            
            const deleteBtn = document.getElementById('manage-user-delete');
            if(deleteBtn) deleteBtn.style.display = 'none';
            
            document.getElementById('manageUserModal').classList.remove('hidden');
            document.getElementById('manageUserModal').style.display = 'flex';
        });
    }

    window.editUser = function(id) {
        const user = window.adminUsersData.find(u => u.id == id);
        if(!user) return;
        
        document.getElementById('manage-user-modal-title').textContent = 'Manage User';
        document.getElementById('manage-user-id').value = user.id;
        document.getElementById('manage-user-name').value = user.full_name || '';
        document.getElementById('manage-user-email').value = user.email || '';
        document.getElementById('manage-user-email').readOnly = true;
        document.getElementById('manage-user-password').value = '';
        document.getElementById('manage-user-phone').value = user.phone || '';
        document.getElementById('manage-user-address').value = user.address || '';
        document.getElementById('manage-user-role').value = user.role;
        
        const avatarPreview = document.getElementById('user-avatar-preview');
        const displayName = user.full_name || user.email;
        if (user.profile_image) {
            avatarPreview.innerHTML = `<img src="${user.profile_image}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            const initials = displayName.substring(0, 2).toUpperCase();
            avatarPreview.innerHTML = initials;
        }
        
        document.getElementById('user-avatar-upload').value = '';
        
        const deleteBtn = document.getElementById('manage-user-delete');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';

        deleteBtn.onclick = () => {
            window.closeModal('manageUserModal');
            deleteUser(user.id);
        };
        
        document.getElementById('manageUserModal').classList.remove('hidden');
        document.getElementById('manageUserModal').style.display = 'flex';
    };

    const manageUserSaveBtn = document.getElementById('manage-user-save');
    if(manageUserSaveBtn) {
        manageUserSaveBtn.addEventListener('click', async () => {
            const formData = new FormData();
            formData.append('id', document.getElementById('manage-user-id').value);
            formData.append('full_name', document.getElementById('manage-user-name').value);
            formData.append('email', document.getElementById('manage-user-email').value);
            formData.append('password', document.getElementById('manage-user-password').value);
            formData.append('phone', document.getElementById('manage-user-phone').value);
            formData.append('address', document.getElementById('manage-user-address').value);
            formData.append('role', document.getElementById('manage-user-role').value);
            
            const imageFile = document.getElementById('user-avatar-upload').files[0];
            if (imageFile) {
                formData.append('profile_image', imageFile);
            }
            
            manageUserSaveBtn.textContent = "Saving...";
            manageUserSaveBtn.disabled = true;

            try {
                const response = await fetch('api/admin_users.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if(result.status === 'success') {
                    showToast('User details updated successfully');
                    setTimeout(() => {
                        window.closeModal('manageUserModal');
                    }, 1000); // Wait 1s so the user clearly sees success before it vanishes
                    fetchUsers();
                } else {
                    showToast(result.message || 'Failed to update user', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Error updating user', 'error');
            } finally {
                manageUserSaveBtn.textContent = "Save Changes";
                manageUserSaveBtn.disabled = false;
            }
        });
    }

    const avatarUploadInput = document.getElementById('user-avatar-upload');
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('user-avatar-preview').innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // --- Reviews Management ---
    let reviewsTableInstance = null;
    
    async function fetchAdminReviews() {
        try {
            const response = await fetch(`api/admin_reviews.php?_t=${Date.now()}`);
            const result = await response.json();
            if(result.status === 'success') {
                renderAdminReviews(result.data);
            } else {
                showToast('Failed to load reviews', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error loading reviews', 'error');
        }
    }
    
    function renderAdminReviews(reviews) {
        if ($.fn.DataTable.isDataTable('#reviewsTable')) {
            $('#reviewsTable').DataTable().destroy();
        }
        
        const list = document.getElementById('admin-reviews-list');
        list.innerHTML = '';
        
        reviews.forEach(r => {
            const tr = document.createElement('tr');
            const reviewDate = new Date(r.created_at).toLocaleDateString();
            const customerName = r.customer_name || r.customer_email || 'Anonymous';
            const itemName = r.menu_item_name || 'Deleted Item';
            let starsHtml = '';
            for(let i=0; i<5; i++) {
                if(i < r.rating) {
                    starsHtml += '<span style="color: #ffc107;">★</span>';
                } else {
                    starsHtml += '<span style="color: #e4e5e9;">★</span>';
                }
            }
            
            tr.innerHTML = `
                <td style="text-align: center;"><input type="checkbox"></td>
                <td>#${r.id}</td>
                <td><strong>${customerName}</strong></td>
                <td>${itemName}</td>
                <td>${starsHtml}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.review_text || ''}">${r.review_text || '<i style="color: #999;">No text</i>'}</td>
                <td>${reviewDate}</td>
                <td style="text-align: right;">
                    <a href="javascript:;" onclick="deleteReview(${r.id})" class="btn btn-default btn-xs" style="color: #c42d2d;"><i class="ph ph-trash"></i> Delete</a>
                </td>
            `;
            list.appendChild(tr);
        });
        
        reviewsTableInstance = $('#reviewsTable').DataTable({
            responsive: true,
            order: [[1, 'desc']],
            language: { search: "Search:" }
        });
    }

    window.deleteReview = async function(id) {
        const confirmed = await window.customConfirm('Are you sure you want to delete this review?');
        if(!confirmed) return;
        
        try {
            const response = await fetch('api/admin_reviews.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await response.json();
            if(result.status === 'success') {
                showToast('Review deleted successfully');
                fetchAdminReviews();
            } else {
                showToast(result.message || 'Failed to delete review', 'error');
            }
        } catch(e) {
            console.error(e);
            showToast('Error deleting review', 'error');
        }
    }

    // --- Staff Management Logic ---
    if (typeof IS_ADMIN !== 'undefined' && IS_ADMIN) {
        let staffTableInstance = null;
        
        window.fetchStaff = async function() {
            try {
                const response = await fetch(`api/admin/staff.php?_t=${Date.now()}`);
                const result = await response.json();
                if (result.status === 'success') {
                    renderStaff(result.data);
                } else {
                    showToast('Failed to fetch staff', 'error');
                }
            } catch (e) {
                console.error(e);
            }
        };

        function renderStaff(staffData) {
            const tbody = document.getElementById('staff-table-body');
            if (!tbody) return;
            
            if (staffTableInstance) {
                staffTableInstance.destroy();
            }
            
            tbody.innerHTML = '';
            staffData.forEach(s => {
                const tr = document.createElement('tr');
                const isActive = parseInt(s.is_active) === 1;
                const toggleColor = isActive ? '#28a745' : '#dc3545';
                const toggleText = isActive ? 'Active' : 'Deactivated';
                
                tr.innerHTML = `
                    <td>${s.full_name || 'N/A'}</td>
                    <td>${s.email}</td>
                    <td>${new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-manage-light" style="color:white; background-color:${toggleColor}; border-color:${toggleColor}; font-weight: bold; width: 110px;" onclick="toggleStaffStatus(${s.id}, ${isActive ? 1 : 0})">${toggleText}</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            staffTableInstance = new DataTable('#staffTable', {
                responsive: true,
                order: [[2, 'desc']],
                pageLength: 5
            });
        }

        window.toggleStaffStatus = async function(id, currentStatus) {
            const newStatus = currentStatus === 1 ? 0 : 1;
            const actionText = newStatus === 1 ? 'activate' : 'deactivate';
            const confirmed = await window.customConfirm(`Are you sure you want to ${actionText} this staff member?`);
            if (!confirmed) return;
            try {
                const res = await fetch('api/admin/staff.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ action: 'toggle_status', id: id, status: newStatus })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(`Staff ${actionText}d successfully`);
                    fetchStaff();
                } else {
                    showToast(`Failed to ${actionText} staff`, 'error');
                }
            } catch(e) {
                showToast(`Error trying to ${actionText} staff`, 'error');
            }
        };

        // Add Staff Modal Logic
        const addStaffBtn = document.getElementById('add-staff-btn');
        const addStaffModal = document.getElementById('add-staff-modal');
        const addStaffForm = document.getElementById('add-staff-form');

        if (addStaffBtn && addStaffModal && addStaffForm) {
            addStaffBtn.addEventListener('click', () => {
                addStaffForm.reset();
                addStaffModal.classList.remove('hidden');
            });

            addStaffForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('staff-email').value;
                const name = document.getElementById('staff-name').value;
                const password = document.getElementById('staff-password').value;

                fetch('api/admin/staff.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ action: 'create', email: email, full_name: name, password: password })
                }).then(res => res.json()).then(result => {
                    if (result.status === 'success') {
                        showToast('Staff added successfully');
                        fetchStaff();
                        addStaffModal.classList.add('hidden');
                    } else {
                        showToast(result.message || 'Failed to add staff', 'error');
                    }
                }).catch(e => {
                    showToast('Error adding staff', 'error');
                });
            });
        }
    }
});

// Item Info Modal Function
window.viewItemInfo = function(name, desc, img) {
    document.getElementById('item-info-title').textContent = name || 'Item Details';
    document.getElementById('item-info-description').textContent = desc || 'No description available.';
    const imgEl = document.getElementById('item-info-image');
    if (img) {
        imgEl.src = img.startsWith('images/') ? img : 'images/' + img;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
        imgEl.src = '';
    }
    document.getElementById('item-info-modal').classList.remove('hidden');
};

window.generatePDF = function(orderId) {
    const order = (window.allOrders || []).find(o => parseInt(o.id) === parseInt(orderId));
    if (!order) {
        alert("Order not found!");
        return;
    }

    const itemsHtml = order.items.map(i => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
            <span>${i.quantity}x ${i.item_name}</span>
            <span>RWF ${i.price * i.quantity}</span>
        </div>
    `).join('');

    const htmlString = `
        <div id="temp-pdf-receipt" style="padding: 30px; font-family: 'Inter', sans-serif; color: #111; background: #fff; width: 400px; box-sizing: border-box; position: absolute; left: -9999px; top: -9999px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0; font-family: 'Magra', sans-serif; font-size: 24px;">ACE CAFE</h1>
                <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Receipt for Order #${order.id}</p>
                <p style="margin: 5px 0 0; color: #666; font-size: 12px;">${new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div style="border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 15px 0; margin-bottom: 20px;">
                ${itemsHtml}
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                <span>Total</span>
                <span>RWF ${order.total_amount}</span>
            </div>
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p style="margin: 2px 0;"><strong>Customer:</strong> ${order.customer_name}</p>
                <p style="margin: 2px 0;"><strong>Phone:</strong> ${order.phone}</p>
                <p style="margin: 2px 0;"><strong>Address:</strong> ${order.address}</p>
                <p style="margin: 2px 0;"><strong>Payment:</strong> ${order.payment_method.toUpperCase()} (${order.payment_status.toUpperCase()})</p>
            </div>
            <div style="text-align: center; margin-top: 40px; font-size: 14px; font-weight: 500; color: #333;">
                Thank you for your order!
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString.trim();
    const element = tempDiv.firstChild;
    document.body.appendChild(element);

    const heightInPx = element.offsetHeight;
    const heightInInches = (heightInPx / 96) + 0.25; // 96 px per inch + margins

    const opt = {
        margin:       0,
        filename:     `Ace_Cafe_Receipt_Order_${order.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: [4.16, heightInInches], orientation: 'portrait' }
    };

    element.style.position = 'static';
    element.style.left = 'auto';
    element.style.top = 'auto';

    html2pdf().set(opt).from(element).save().then(() => {
        element.remove();
    });
};

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            if (isDark) {
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.classList.replace('ph-moon', 'ph-sun');
            } else {
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.classList.replace('ph-sun', 'ph-moon');
            }
        });
    }
});
