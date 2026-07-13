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
                renderExtras();
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
            card.style.position = 'relative';
            
            // Generate initials or fallback image if needed, though they should have images
            const imgSrc = item.image ? item.image : "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23E3F0EE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%231A3B47%22%20font-family%3D%22Arial%22%20font-size%3D%2214px%22%3ENo Img%3C%2Ftext%3E%3C%2Fsvg%3E";

            let stockBadge = '';
            if (item.is_available == 0) {
                stockBadge = '<span style="background:#ff4d4f; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; position:absolute; top:10px; right:10px; z-index:5;">Unavailable</span>';
            } else if (item.track_stock == 1) {
                if (item.stock_quantity == 0) {
                    stockBadge = '<span style="background:#ff4d4f; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; position:absolute; top:10px; right:10px; z-index:5;">Out of Stock</span>';
                } else if (item.stock_quantity <= 5) {
                    stockBadge = `<span style="background:#ffa940; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; position:absolute; top:10px; right:10px; z-index:5;">Low Stock (${item.stock_quantity})</span>`;
                } else {
                    stockBadge = `<span style="background:#52c41a; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; position:absolute; top:10px; right:10px; z-index:5;">Stock: ${item.stock_quantity}</span>`;
                }
            } else {
                stockBadge = '<span style="background:#52c41a; color:white; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; position:absolute; top:10px; right:10px; z-index:5;">Unlimited</span>';
            }

            card.innerHTML = `
                ${stockBadge}
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

    // Helper to sync Free/Paid radio options with price input
    function updatePriceTypeToggles(price) {
        const isFree = price !== '' && parseInt(price) === 0;
        const freeRadio = document.getElementById('price-type-free');
        const paidRadio = document.getElementById('price-type-paid');
        const priceInputContainer = document.getElementById('price-input-container');
        const priceInput = document.getElementById('item-price');
        
        if (isFree) {
            if (freeRadio) freeRadio.checked = true;
            if (priceInputContainer) priceInputContainer.style.display = 'none';
            if (priceInput) {
                priceInput.required = false;
                priceInput.value = 0;
            }
        } else {
            if (paidRadio) paidRadio.checked = true;
            if (priceInputContainer) priceInputContainer.style.display = 'block';
            if (priceInput) {
                priceInput.required = true;
                priceInput.value = price;
            }
        }
    }

    // Open Modal
    function openModal(isEdit = false, item = null) {
        modal.classList.remove('hidden');
        const deleteBtn = document.getElementById('admin-delete-btn');
        const stockQtyGroup = document.getElementById('stock-qty-group');
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
            
            document.getElementById('item-track-stock').value = item.track_stock || '0';
            document.getElementById('item-stock-qty').value = item.stock_quantity !== null ? item.stock_quantity : '0';
            document.getElementById('item-is-available').value = item.is_available !== null ? item.is_available : '1';
            if (stockQtyGroup) {
                stockQtyGroup.style.display = item.track_stock == 1 ? 'block' : 'none';
            }
            
            updatePriceTypeToggles(item.price);
            
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
            
            document.getElementById('item-track-stock').value = '0';
            document.getElementById('item-stock-qty').value = '0';
            document.getElementById('item-is-available').value = '1';
            if (stockQtyGroup) stockQtyGroup.style.display = 'none';
            
            updatePriceTypeToggles('');
        }
    }

    // Close Modal
    function closeModal() {
        if(modal) modal.classList.add('hidden');
    }

    if(addBtn) addBtn.addEventListener('click', () => openModal(false));
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    // Track Stock selector listener
    const trackStockSelect = document.getElementById('item-track-stock');
    const stockQtyGroup = document.getElementById('stock-qty-group');
    if (trackStockSelect && stockQtyGroup) {
        trackStockSelect.addEventListener('change', () => {
            stockQtyGroup.style.display = trackStockSelect.value === '1' ? 'block' : 'none';
        });
    }

    // Pricing Option Radio event listeners
    const freeRadio = document.getElementById('price-type-free');
    const paidRadio = document.getElementById('price-type-paid');
    const priceInputContainer = document.getElementById('price-input-container');
    const priceInput = document.getElementById('item-price');

    if (freeRadio && paidRadio) {
        freeRadio.addEventListener('change', () => {
            if (freeRadio.checked) {
                if (priceInputContainer) priceInputContainer.style.display = 'none';
                if (priceInput) {
                    priceInput.required = false;
                    priceInput.value = 0;
                }
            }
        });
        
        paidRadio.addEventListener('change', () => {
            if (paidRadio.checked) {
                if (priceInputContainer) priceInputContainer.style.display = 'block';
                if (priceInput) {
                    priceInput.required = true;
                    if (priceInput.value == 0) priceInput.value = '';
                }
            }
        });
    }

    // Form Submission
    if(form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('item-id').value;
        const formData = new FormData();
        
        formData.append('name', document.getElementById('item-name').value);
        formData.append('category', document.getElementById('item-category').value);
        formData.append('price', document.getElementById('item-price').value);
        formData.append('description', document.getElementById('item-desc').value);
        formData.append('track_stock', document.getElementById('item-track-stock').value);
        formData.append('stock_quantity', document.getElementById('item-stock-qty').value);
        formData.append('is_available', document.getElementById('item-is-available').value);
        
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

    // --- Extras Management ---
    function renderExtras() {
        const previewGrid = document.getElementById('admin-extras-preview-grid');
        const listGrid = document.getElementById('admin-extras-list');
        if (!previewGrid || !listGrid) return;
        
        const extras = menuData.filter(item => item.category === 'extras');
        
        // Update stats
        const countLabel = document.getElementById('extras-count-label');
        if(countLabel) {
            countLabel.textContent = `${extras.length} Extras`;
        }

        // 1. Render Storefront Preview Grid
        previewGrid.innerHTML = extras.map(extra => {
            const priceDisplay = parseInt(extra.price) === 0 
                ? '<span style="color: #2ed573; font-weight: bold;">FREE</span>' 
                : extra.price;
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(122, 28, 36, 0.05); border: 1px solid rgba(122, 28, 36, 0.1); padding: 6px 10px; border-radius: 6px; font-size: 12px; opacity: 0.9;">
                    <span style="color: var(--text-color); font-weight: 500;">${extra.name} <span style="opacity: 0.7; font-size: 10px;">(${priceDisplay})</span></span>
                    <span style="color: var(--brand-red); font-weight: bold; font-size: 16px; padding: 0 4px; cursor: default;">+</span>
                </div>
            `;
        }).join('') || '<div style="color: #8c9ea6; font-size: 12px; grid-column: span 2;">No extras found. Add one below!</div>';

        // 2. Render Administration Grid
        listGrid.innerHTML = '';
        extras.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dealer-card';
            const imgSrc = item.image ? item.image : "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23E3F0EE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%231A3B47%22%20font-family%3D%22Arial%22%20font-size%3D%2214px%22%3ENo Img%3C%2Ftext%3E%3C%2Fsvg%3E";
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imgSrc}" class="card-img" alt="${item.name}">
                </div>
                <div class="card-body">
                    <div class="card-header-row">
                        <span class="card-category">${parseInt(item.price) === 0 ? '<span style="color: #2ed573; font-weight: bold;">FREE</span>' : `RWF ${item.price}`}</span>
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${item.description || 'No description'}</p>
                    <div class="card-actions">
                        <button onclick="editItem(${item.id})" class="btn-action btn-edit" title="Edit Item" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #1A3B47; font-family: inherit;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            Edit
                        </button>
                        <button onclick="deleteItem(${item.id})" class="btn-action btn-delete" title="Delete Item" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #ff4757; font-family: inherit;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
            listGrid.appendChild(card);
        });
    }

    const addExtraBtn = document.getElementById('add-new-extra-btn');
    if (addExtraBtn) {
        addExtraBtn.addEventListener('click', () => {
            openModal(false);
            modalTitle.textContent = 'Add New Extra';
            document.getElementById('item-category').value = 'extras';
        });
    }

    // --- Coupons Management ---
    let couponData = [];
    const couponModal = document.getElementById('admin-coupon-modal');
    const couponForm = document.getElementById('coupon-form');
    const couponTitle = document.getElementById('coupon-modal-title');
    const couponsList = document.getElementById('admin-coupons-list');
    
    async function fetchCoupons() {
        if (!couponsList) return;
        couponsList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading coupons...</td></tr>';
        
        try {
            const response = await fetch(`api/admin_coupons.php?_t=${new Date().getTime()}`);
            if (response.ok) {
                const res = await response.json();
                if (res.status === 'success') {
                    couponData = res.data;
                    renderCoupons();
                }
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    }

    function renderCoupons() {
        if (!couponsList) return;
        couponsList.innerHTML = '';
        
        const countLabel = document.getElementById('coupon-count-label');
        if(countLabel) {
            countLabel.textContent = `${couponData.length} Coupons`;
        }

        if (couponData.length === 0) {
            couponsList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">No coupons created yet.</td></tr>';
            return;
        }

        couponData.forEach(coupon => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid var(--border-color);';
            
            const statusBadge = coupon.active == 1 
                ? '<span style="background: rgba(46, 213, 115, 0.15); color: #2ed573; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">Active</span>'
                : '<span style="background: rgba(255, 71, 87, 0.15); color: #ff4757; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">Inactive</span>';
            
            const typeDisplay = coupon.type === 'percent' ? 'Percent' : 'Flat';
            const valueDisplay = coupon.type === 'percent' ? `${coupon.value}%` : `RWF ${coupon.value}`;
            
            tr.innerHTML = `
                <td style="padding: 14px 16px; font-weight: 700; color: var(--text-color); font-family: monospace; font-size: 15px;">${coupon.code}</td>
                <td style="padding: 14px 16px; color: var(--text-muted);">${typeDisplay}</td>
                <td style="padding: 14px 16px; font-weight: 600; color: var(--text-color);">${valueDisplay}</td>
                <td style="padding: 14px 16px; color: var(--text-muted);">RWF ${coupon.min_order_amount}</td>
                <td style="padding: 14px 16px;">${statusBadge}</td>
                <td style="padding: 14px 16px; text-align: right;">
                    <div style="display: flex; justify-content: flex-end; gap: 12px;">
                        <button class="edit-coupon-btn" data-id="${coupon.id}" style="background: none; border: none; cursor: pointer; color: var(--text-color); font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 4px;">Edit</button>
                        <button class="delete-coupon-btn" data-id="${coupon.id}" style="background: none; border: none; cursor: pointer; color: #ff4757; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 4px;">Delete</button>
                    </div>
                </td>
            `;
            
            // Bind edit/delete click listeners
            tr.querySelector('.edit-coupon-btn').addEventListener('click', () => openCouponModal(true, coupon));
            tr.querySelector('.delete-coupon-btn').addEventListener('click', () => deleteCoupon(coupon.id));
            
            couponsList.appendChild(tr);
        });
    }

    function openCouponModal(isEdit = false, coupon = null) {
        if (!couponModal) return;
        couponModal.classList.remove('hidden');
        
        if (isEdit && coupon) {
            couponTitle.textContent = 'Edit Coupon';
            document.getElementById('coupon-id').value = coupon.id;
            document.getElementById('coupon-code').value = coupon.code;
            document.getElementById('coupon-type').value = coupon.type;
            document.getElementById('coupon-value').value = coupon.value;
            document.getElementById('coupon-min-order').value = coupon.min_order_amount;
            document.getElementById('coupon-active').value = coupon.active;
        } else {
            couponTitle.textContent = 'Add New Coupon';
            if (couponForm) couponForm.reset();
            document.getElementById('coupon-id').value = '';
            document.getElementById('coupon-min-order').value = 0;
            document.getElementById('coupon-active').value = 1;
        }
    }

    function closeCouponModal() {
        if (couponModal) couponModal.classList.add('hidden');
    }

    async function deleteCoupon(id) {
        const confirmed = await window.customConfirm('Are you sure you want to delete this coupon?');
        if (confirmed) {
            try {
                const response = await fetch(`api/admin_coupons.php?id=${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    showToast('Coupon deleted successfully!');
                    fetchCoupons();
                } else {
                    showToast(result.message || 'Error deleting coupon', 'error');
                }
            } catch (error) {
                console.error('Error deleting coupon:', error);
                showToast('Failed to delete coupon', 'error');
            }
        }
    }

    // Modal click listeners
    const addCouponBtn = document.getElementById('add-new-coupon-btn');
    if (addCouponBtn) addCouponBtn.addEventListener('click', () => openCouponModal(false));
    
    const closeCouponBtn = document.getElementById('coupon-close-modal');
    if (closeCouponBtn) closeCouponBtn.addEventListener('click', closeCouponModal);

    // Form submission
    if (couponForm) {
        couponForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                id: document.getElementById('coupon-id').value ? parseInt(document.getElementById('coupon-id').value) : 0,
                code: document.getElementById('coupon-code').value.toUpperCase().trim(),
                type: document.getElementById('coupon-type').value,
                value: parseInt(document.getElementById('coupon-value').value),
                min_order_amount: parseInt(document.getElementById('coupon-min-order').value),
                active: parseInt(document.getElementById('coupon-active').value)
            };
            
            try {
                const response = await fetch('api/admin_coupons.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    showToast(payload.id > 0 ? 'Coupon updated!' : 'Coupon created!');
                    closeCouponModal();
                    fetchCoupons();
                } else {
                    showToast(result.message || 'Error saving coupon', 'error');
                }
            } catch (error) {
                console.error('Error saving coupon:', error);
                showToast('Failed to save coupon', 'error');
            }
        });
    }

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
                    if(target === 'section-extras') renderExtras();
                    if(target === 'section-coupons') fetchCoupons();
                    if(target === 'section-staff' && typeof fetchStaff === 'function') fetchStaff();
                    if(target === 'section-reviews') fetchAdminReviews();
                    if(target === 'section-analytics') {
                        const filterVal = document.getElementById('analytics-date-filter').value;
                        fetchAnalytics(filterVal);
                    }
                    if(target === 'section-inventory') fetchInventory();
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
            } else if(order.status === 'complete_awaiting_pickup') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #1E3E62; color: #fff; border: 1px solid #162f4a; font-size: 12px; font-weight: 500;">Ready</span>';
            } else if(order.status === 'out_for_delivery') {
                fulfillmentBadge = '<span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background: #6c5ce7; color: #fff; border: 1px solid #5849c4; font-size: 12px; font-weight: 500;">Delivering</span>';
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
                                <a href="#" onclick="updateOrderStatus(${order.id}, 'out_for_delivery')" style="padding: 4px 8px; font-size: 11px; background: #6c5ce7; color: #fff; border: 1px solid #5849c4; border-radius: 4px; text-decoration: none;">Delivering</a>
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
            
            const photoThumbnail = r.photo 
                ? `<br><a href="${r.photo}" target="_blank" style="margin-top: 4px; display: inline-block;"><img src="${r.photo}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"></a>`
                : '';

            tr.innerHTML = `
                <td style="text-align: center;"><input type="checkbox"></td>
                <td>#${r.id}</td>
                <td><strong>${customerName}</strong></td>
                <td>${itemName}</td>
                <td>${starsHtml}</td>
                <td style="max-width: 250px; white-space: normal;" title="${r.review_text || ''}">
                    <div>${r.review_text || '<i style="color: #999;">No text</i>'}</div>
                    ${photoThumbnail}
                </td>
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

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // INVENTORY MANAGEMENT SYSTEM
    // ==========================================
    let cachedInventoryItems = [];

    // Switch sub-tabs within the Inventory section
    window.switchInventorySubtab = function(subtab) {
        document.querySelectorAll('.inventory-subtab-pane').forEach(pane => pane.style.display = 'none');
        const activePane = document.getElementById(`inv-subtab-${subtab}`);
        if (activePane) activePane.style.display = 'block';

        // Toggle button styling
        const buttons = {
            levels: document.getElementById('subtab-levels-btn'),
            recipes: document.getElementById('subtab-recipes-btn'),
            reports: document.getElementById('subtab-reports-btn'),
            planner: document.getElementById('subtab-planner-btn')
        };

        for (const [key, btn] of Object.entries(buttons)) {
            if (btn) {
                if (key === subtab) {
                    btn.classList.add('active-subtab');
                    btn.style.backgroundColor = '#1A3B47';
                    btn.style.color = '#fff';
                } else {
                    btn.classList.remove('active-subtab');
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#1A3B47';
                }
            }
        }

        // Fetch data based on subtab
        if (subtab === 'levels') renderInventoryItems();
        if (subtab === 'recipes') renderRecipesGrid();
        if (subtab === 'reports') fetchInventoryReports();
        if (subtab === 'planner') loadBuffetPlanner();
    };

    // Main fetch orchestrator
    window.fetchInventory = function() {
        // Default to showing levels subtab
        switchInventorySubtab('levels');
    };

    // Load and render inventory items
    async function renderInventoryItems() {
        const tbody = document.getElementById('inventory-items-list');
        if (!tbody) return;

        if ($.fn.DataTable.isDataTable('#inventoryTable')) {
            $('#inventoryTable').DataTable().destroy();
        }

        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading ingredients...</td></tr>';

        try {
            const res = await fetch('api/admin_inventory.php?action=get_items');
            const result = await res.json();
            if (result.status === 'success') {
                cachedInventoryItems = result.data;
                window.cachedInventoryItems = cachedInventoryItems;
                tbody.innerHTML = '';
                if (cachedInventoryItems.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No ingredients added yet.</td></tr>';
                    window.renderStockChart([]);
                    return;
                }
                window.renderStockChart(cachedInventoryItems);

                cachedInventoryItems.forEach(item => {
                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #eee';
                    
                    let statusBadge = '';
                    const qty = parseFloat(item.current_quantity);
                    const reorder = parseFloat(item.reorder_level);
                    if (qty === 0) {
                        statusBadge = '<span class="badge badge-danger" style="background:#c42d2d;color:white;padding:2px 4px;border-radius:4px;font-size:10px;">Out of Stock</span>';
                    } else if (qty <= reorder) {
                        statusBadge = '<span class="badge badge-warning" style="background:#d97706;color:white;padding:2px 4px;border-radius:4px;font-size:10px;">Low Stock</span>';
                    } else {
                        statusBadge = '<span class="badge badge-success" style="background:#28a745;color:white;padding:2px 4px;border-radius:4px;font-size:10px;">In Stock</span>';
                    }

                    row.innerHTML = `
                        <td style="padding: 12px 16px; font-weight:600;">${item.name}</td>
                        <td style="padding: 12px 16px; text-transform:capitalize;">${item.category.replace('_', ' ')}</td>
                        <td style="padding: 12px 16px; font-weight:bold;">${qty.toFixed(2)} ${item.unit}</td>
                        <td style="padding: 12px 16px;">${reorder.toFixed(2)} ${item.unit}</td>
                        <td style="padding: 12px 16px;">${parseFloat(item.target_quantity).toFixed(2)} ${item.unit}</td>
                        <td style="padding: 12px 16px;">${statusBadge}</td>
                        <td style="padding: 12px 16px; text-align: right;">
                            <button class="btn btn-secondary btn-sm" onclick="editInventoryItem(${item.id})" style="padding:4px 8px; font-size:12px; margin-right:5px;"><i class="ph ph-pencil"></i> Edit</button>
                            ${item.category === 'perishable' ? `<button class="btn btn-secondary btn-sm" onclick="manageBatches(${item.id}, '${item.name}', '${item.unit}')" style="padding:4px 8px; font-size:12px; margin-right:5px; background:#e1e3e5; color:#1A3B47;"><i class="ph ph-package"></i> Batches</button>` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteInventoryItem(${item.id})" style="padding:4px 8px; font-size:12px; background:#c42d2d; color:white; border-color:#c42d2d;"><i class="ph ph-trash"></i> Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Initialize DataTable
                $('#inventoryTable').DataTable({
                    responsive: true,
                    pageLength: 5,
                    lengthMenu: [5, 10, 25, 50],
                    pagingType: 'simple_numbers',
                    language: {
                        search: "Search:",
                        paginate: {
                            previous: '<span style="font-weight: 700; font-family: monospace; font-size: 14px; margin-right: 2px;">&lt;</span>',
                            next: '<span style="font-weight: 700; font-family: monospace; font-size: 14px;">&gt;</span>'
                        }
                    }
                });
            } else {
                showToast(result.message || 'Failed to load ingredients', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error loading ingredients', 'error');
        }
    }

    // Add ingredient button handler
    const addIngBtn = document.getElementById('add-ingredient-btn');
    if (addIngBtn) {
        addIngBtn.addEventListener('click', () => {
            document.getElementById('inventory-item-form').reset();
            document.getElementById('inventory-item-id').value = '';
            document.getElementById('inventory-item-modal-title').textContent = 'Add New Ingredient';
            document.getElementById('inventory-item-modal').classList.remove('hidden');
        });
    }

    // Save ingredient submit handler
    const ingForm = document.getElementById('inventory-item-form');
    if (ingForm) {
        ingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('inventory-item-id').value;
            const name = document.getElementById('inventory-item-name').value;
            const category = document.getElementById('inventory-item-category').value;
            const unit = document.getElementById('inventory-item-unit').value;
            const current_quantity = document.getElementById('inventory-item-current-qty').value;
            const reorder_level = document.getElementById('inventory-item-reorder-level').value;
            const target_quantity = document.getElementById('inventory-item-target-qty').value;

            try {
                const res = await fetch('api/admin_inventory.php?action=save_item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name, category, unit, current_quantity, reorder_level, target_quantity })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(result.message);
                    document.getElementById('inventory-item-modal').classList.add('hidden');
                    renderInventoryItems();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to save ingredient', 'error');
            }
        });
    }

    // Edit inventory item
    window.editInventoryItem = function(id) {
        const item = cachedInventoryItems.find(i => i.id == id);
        if (!item) return;

        document.getElementById('inventory-item-id').value = item.id;
        document.getElementById('inventory-item-name').value = item.name;
        document.getElementById('inventory-item-category').value = item.category;
        document.getElementById('inventory-item-unit').value = item.unit;
        document.getElementById('inventory-item-current-qty').value = item.current_quantity;
        document.getElementById('inventory-item-reorder-level').value = item.reorder_level;
        document.getElementById('inventory-item-target-qty').value = item.target_quantity;

        document.getElementById('inventory-item-modal-title').textContent = 'Edit Ingredient';
        document.getElementById('inventory-item-modal').classList.remove('hidden');
    };

    // Delete inventory item
    window.deleteInventoryItem = function(id) {
        const item = cachedInventoryItems.find(i => i.id == id);
        if (!item) return;

        // Use custom confirm modal if exists, else standard confirm
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal) {
            document.getElementById('confirm-modal-title').textContent = 'Delete Ingredient';
            document.getElementById('confirm-modal-message').textContent = `Are you sure you want to delete '${item.name}'? This will also remove any recipe mappings.`;
            confirmModal.classList.remove('hidden');
            
            const okBtn = document.getElementById('confirm-modal-ok');
            const cancelBtn = document.getElementById('confirm-modal-cancel');
            
            const onOk = async () => {
                confirmModal.classList.add('hidden');
                cleanup();
                try {
                    const res = await fetch('api/admin_inventory.php?action=delete_item', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    });
                    const result = await res.json();
                    if (result.status === 'success') {
                        showToast(result.message);
                        renderInventoryItems();
                    } else {
                        showToast(result.message, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Failed to delete item', 'error');
                }
            };
            
            const onCancel = () => {
                confirmModal.classList.add('hidden');
                cleanup();
            };
            
            function cleanup() {
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
            }
            
            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
        } else {
            if (confirm(`Delete '${item.name}'?`)) {
                (async () => {
                    try {
                        const res = await fetch('api/admin_inventory.php?action=delete_item', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id })
                        });
                        const result = await res.json();
                        if (result.status === 'success') {
                            showToast(result.message);
                            renderInventoryItems();
                        } else {
                            showToast(result.message, 'error');
                        }
                    } catch (err) {
                        showToast('Failed to delete item', 'error');
                    }
                })();
            }
        }
    };

    // ==========================================
    // BATCH MANAGEMENT
    // ==========================================
    let currentBatchItemName = '';
    let currentBatchItemUnit = '';

    window.manageBatches = function(itemId, itemName, itemUnit) {
        currentBatchItemName = itemName;
        currentBatchItemUnit = itemUnit;
        
        document.getElementById('batch-inventory-item-id').value = itemId;
        document.getElementById('batches-modal-title').textContent = `Manage Batches: ${itemName}`;
        document.getElementById('batch-unit-label').textContent = itemUnit;

        // Reset the add batch form
        document.getElementById('add-batch-form').reset();
        document.getElementById('batch-received-date').value = new Date().toISOString().split('T')[0];

        // Fetch and show current batches
        fetchAndRenderBatches(itemId);

        document.getElementById('inventory-batches-modal').classList.remove('hidden');
    };

    async function fetchAndRenderBatches(itemId) {
        const tbody = document.getElementById('batches-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading batches...</td></tr>';

        try {
            const res = await fetch(`api/admin_inventory.php?action=get_batches&item_id=${itemId}`);
            const result = await res.json();
            if (result.status === 'success') {
                tbody.innerHTML = '';
                if (result.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No batches received yet.</td></tr>';
                    return;
                }

                result.data.forEach(batch => {
                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #eee';
                    
                    const qtyLeft = parseFloat(batch.quantity_remaining);
                    
                    let expiryStr = batch.expiration_date || 'N/A';
                    let expiryStyle = '';
                    let actionButtons = '';

                    if (batch.status === 'spoiled') {
                        expiryStr = '<span style="color:#c42d2d;font-weight:bold;">Spoiled/Wasted</span>';
                    } else if (batch.expiration_date) {
                        const expDate = new Date(batch.expiration_date);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const diffTime = expDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                            expiryStr = `<span style="color:#c42d2d;font-weight:bold;">Expired (${batch.expiration_date})</span>`;
                        } else if (diffDays <= 3) {
                            expiryStr = `<span style="color:#d97706;font-weight:bold;">Expiring soon (${batch.expiration_date})</span>`;
                        }
                    }

                    if (qtyLeft > 0 && batch.status !== 'spoiled') {
                        actionButtons = `
                            <button class="btn btn-secondary btn-sm" onclick="spoilBatch(${batch.id}, ${itemId})" style="padding:2px 6px; font-size:11px; background:#fbebeb; color:#c42d2d; border-color:#fbebeb; margin-right:4px;"><i class="ph ph-skull"></i> Spoil</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBatch(${batch.id}, ${itemId})" style="padding:2px 6px; font-size:11px; background:#c42d2d; color:white; border-color:#c42d2d;"><i class="ph ph-trash"></i> Delete</button>
                        `;
                    } else {
                        actionButtons = `<button class="btn btn-danger btn-sm" onclick="deleteBatch(${batch.id}, ${itemId})" style="padding:2px 6px; font-size:11px; background:#c42d2d; color:white; border-color:#c42d2d;"><i class="ph ph-trash"></i> Delete</button>`;
                    }

                    row.innerHTML = `
                        <td style="padding: 8px;">${batch.batch_number || 'N/A'}</td>
                        <td style="padding: 8px;">${batch.received_date}</td>
                        <td style="padding: 8px;">${expiryStr}</td>
                        <td style="padding: 8px; font-weight:bold;">${qtyLeft.toFixed(2)} / ${parseFloat(batch.quantity_received).toFixed(2)} ${currentBatchItemUnit}</td>
                        <td style="padding: 8px; text-align: right;">${actionButtons}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error: ${result.message}</td></tr>`;
            }
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to fetch batches.</td></tr>';
        }
    }

    // Save batch form submit handler
    const batchForm = document.getElementById('add-batch-form');
    if (batchForm) {
        batchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inventory_item_id = document.getElementById('batch-inventory-item-id').value;
            const batch_number = document.getElementById('batch-number').value;
            const quantity_received = document.getElementById('batch-qty-received').value;
            const received_date = document.getElementById('batch-received-date').value;
            const expiration_date = document.getElementById('batch-expiration-date').value;

            try {
                const res = await fetch('api/admin_inventory.php?action=save_batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inventory_item_id, batch_number, quantity_received, received_date, expiration_date })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(result.message);
                    fetchAndRenderBatches(inventory_item_id);
                    renderInventoryItems(); // Refresh quantities on main table
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to add batch', 'error');
            }
        });
    }

    // Spoil batch
    window.spoilBatch = async function(batchId, itemId) {
        if (confirm('Mark this batch as spoiled? All remaining quantities will be set to 0 and deducted from stock.')) {
            try {
                const res = await fetch('api/admin_inventory.php?action=spoil_batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: batchId })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(result.message);
                    fetchAndRenderBatches(itemId);
                    renderInventoryItems();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to adjust batch', 'error');
            }
        }
    };

    // Delete batch
    window.deleteBatch = async function(batchId, itemId) {
        if (confirm('Delete this batch? Remaining quantities will be deducted from main stock count.')) {
            try {
                const res = await fetch('api/admin_inventory.php?action=delete_batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: batchId })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(result.message);
                    fetchAndRenderBatches(itemId);
                    renderInventoryItems();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to delete batch', 'error');
            }
        }
    };

    // ==========================================
    // RECIPE CONFIGURATION
    // ==========================================
    async function renderRecipesGrid() {
        const tbody = document.getElementById('inventory-recipes-list');
        if (!tbody) return;

        if ($.fn.DataTable.isDataTable('#inventoryRecipesTable')) {
            $('#inventoryRecipesTable').DataTable().destroy();
        }

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading menu items...</td></tr>';

        try {
            const res = await fetch('api/admin_inventory.php?action=get_menu_recipes');
            const result = await res.json();
            if (result.status === 'success') {
                tbody.innerHTML = '';
                if (result.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No menu items found.</td></tr>';
                    return;
                }

                result.data.forEach(menuItem => {
                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #eee';

                    let ingCountBadge = '';
                    const count = parseInt(menuItem.ingredient_count);
                    if (count > 0) {
                        ingCountBadge = `<span style="background:#e8f4fd;color:#007bff;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:12px;">${count} Ingredients Mapped</span>`;
                    } else {
                        ingCountBadge = '<span style="background:#fbebeb;color:#c42d2d;padding:4px 8px;border-radius:4px;font-size:12px;">No Recipe Mapped</span>';
                    }

                    row.innerHTML = `
                        <td style="padding: 12px 16px; font-weight:600;">${menuItem.name}</td>
                        <td style="padding: 12px 16px; text-transform:capitalize;">${menuItem.category}</td>
                        <td style="padding: 12px 16px; font-weight:bold;">RWF ${parseInt(menuItem.price).toLocaleString()}</td>
                        <td style="padding: 12px 16px;">${ingCountBadge}</td>
                        <td style="padding: 12px 16px; text-align: right;">
                            <button class="btn btn-secondary btn-sm" onclick="editRecipe(${menuItem.id}, '${menuItem.name.replace(/'/g, "\\'")}')" style="padding:4px 8px; font-size:12px; background:#1A3B47; color:white; border-color:#1A3B47;"><i class="ph ph-gear"></i> Set Recipe</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Initialize DataTable
                $('#inventoryRecipesTable').DataTable({
                    responsive: true,
                    pageLength: 5,
                    lengthMenu: [5, 10, 25, 50],
                    pagingType: 'simple_numbers',
                    language: {
                        search: "Search:",
                        paginate: {
                            previous: '<span style="font-weight: 700; font-family: monospace; font-size: 14px; margin-right: 2px;">&lt;</span>',
                            next: '<span style="font-weight: 700; font-family: monospace; font-size: 14px;">&gt;</span>'
                        }
                    }
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error: ${result.message}</td></tr>`;
            }
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to fetch menu recipes list.</td></tr>';
        }
    }

    // Open edit recipe modal
    window.editRecipe = async function(menuId, menuName) {
        document.getElementById('recipe-menu-id').value = menuId;
        document.getElementById('recipe-modal-title').textContent = `Recipe: ${menuName}`;
        
        const container = document.getElementById('recipe-ingredients-container');
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading recipe data...</div>';

        document.getElementById('recipe-modal').classList.remove('hidden');

        try {
            const res = await fetch(`api/admin_inventory.php?action=get_recipe&menu_id=${menuId}`);
            const result = await res.json();
            if (result.status === 'success') {
                container.innerHTML = '';
                if (result.data.length === 0) {
                    // Start with one empty row
                    addRecipeIngredientRow();
                } else {
                    result.data.forEach(item => {
                        addRecipeIngredientRow(item.inventory_item_id, item.quantity_required);
                    });
                }
            } else {
                container.innerHTML = `<div style="text-align:center;color:red;padding:20px;">Error: ${result.message}</div>`;
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="text-align:center;color:red;padding:20px;">Failed to load recipe ingredients.</div>';
        }
    };

    // Add ingredient row in recipe form modal
    window.addRecipeIngredientRow = function(selectedId = '', qty = '') {
        const container = document.getElementById('recipe-ingredients-container');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'recipe-row';
        row.style.cssText = 'display: flex; gap: 10px; align-items: center; margin-bottom: 10px;';

        // Select options
        let selectOptions = '<option value="">-- Select Ingredient --</option>';
        cachedInventoryItems.forEach(item => {
            const isSelected = item.id == selectedId ? 'selected' : '';
            selectOptions += `<option value="${item.id}" data-unit="${item.unit}" ${isSelected}>${item.name} (${item.unit})</option>`;
        });

        row.innerHTML = `
            <select class="form-input recipe-ingredient-select" style="flex:2;" required onchange="updateRecipeUnitLabel(this)">
                ${selectOptions}
            </select>
            <input type="number" step="0.001" class="form-input recipe-ingredient-qty" style="flex:1;" required value="${qty}" placeholder="Qty (e.g. 0.15)">
            <span class="recipe-ingredient-unit-badge" style="width:50px; font-weight:bold; color:#666;">
                ${selectedId ? (cachedInventoryItems.find(i => i.id == selectedId)?.unit || '') : ''}
            </span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()" style="background:#fbebeb;color:#c42d2d;border-color:#fbebeb;padding:6px 10px;font-weight:bold;">X</button>
        `;

        container.appendChild(row);
    };

    // Helper to update unit label in recipe rows
    window.updateRecipeUnitLabel = function(selectElem) {
        const selectedOption = selectElem.options[selectElem.selectedIndex];
        const unit = selectedOption.getAttribute('data-unit') || '';
        const badge = selectElem.parentElement.querySelector('.recipe-ingredient-unit-badge');
        if (badge) badge.textContent = unit;
    };

    // Save recipe form submit handler
    const recForm = document.getElementById('recipe-form');
    if (recForm) {
        recForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const menuId = document.getElementById('recipe-menu-id').value;
            
            // Gather rows
            const rows = document.querySelectorAll('.recipe-row');
            const ingredients = [];
            
            rows.forEach(row => {
                const select = row.querySelector('.recipe-ingredient-select');
                const qtyInput = row.querySelector('.recipe-ingredient-qty');
                
                const inventory_item_id = select.value;
                const quantity_required = qtyInput.value;
                
                if (inventory_item_id && quantity_required) {
                    ingredients.push({
                        inventory_item_id: parseInt(inventory_item_id),
                        quantity_required: parseFloat(quantity_required)
                    });
                }
            });

            try {
                const res = await fetch('api/admin_inventory.php?action=save_recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ menu_id: menuId, ingredients })
                });
                const result = await res.json();
                if (result.status === 'success') {
                    showToast(result.message);
                    document.getElementById('recipe-modal').classList.add('hidden');
                    renderRecipesGrid();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to save recipe', 'error');
            }
        });
    }

    // ==========================================
    // INVENTORY REPORTS
    // ==========================================
    async function fetchInventoryReports() {
        const stockTbody = document.getElementById('report-stock-list');
        const purchaseTbody = document.getElementById('report-purchase-list');
        if (!stockTbody || !purchaseTbody) return;

        stockTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading stock report...</td></tr>';
        purchaseTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading shopping list...</td></tr>';

        try {
            const res = await fetch('api/admin_inventory.php?action=get_report');
            const result = await res.json();
            if (result.status === 'success') {
                const { stock_report, shopping_list } = result.data;
                
                // Draw Remaining Stock Overview
                stockTbody.innerHTML = '';
                if (stock_report.length === 0) {
                    stockTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No items recorded.</td></tr>';
                } else {
                    stock_report.forEach(item => {
                        const tr = document.createElement('tr');
                        tr.style.borderBottom = '1px solid #eee';

                        let statusBadge = '';
                        if (item.stock_status === 'Out of Stock') {
                            statusBadge = '<span style="color:#c42d2d;font-weight:bold;">Out of Stock</span>';
                        } else if (item.stock_status === 'Low Stock') {
                            statusBadge = '<span style="color:#d97706;font-weight:bold;">Low Stock</span>';
                        } else {
                            statusBadge = '<span style="color:#28a745;font-weight:bold;">In Stock</span>';
                        }

                        const expired = parseFloat(item.quantity_expired);
                        const expiringSoon = parseFloat(item.quantity_expiring_soon);

                        tr.innerHTML = `
                            <td style="padding:10px 16px; font-weight:600;">${item.name}</td>
                            <td style="padding:10px 16px; text-transform:capitalize;">${item.category.replace('_', ' ')}</td>
                            <td style="padding:10px 16px; font-weight:bold;">${parseFloat(item.current_quantity).toFixed(2)} ${item.unit}</td>
                            <td style="padding:10px 16px;">${statusBadge}</td>
                            <td style="padding:10px 16px; font-weight:bold; color:${expired > 0 ? '#c42d2d' : '#666'};">${expired > 0 ? `${expired.toFixed(2)} ${item.unit}` : '-'}</td>
                            <td style="padding:10px 16px; font-weight:bold; color:${expiringSoon > 0 ? '#d97706' : '#666'};">${expiringSoon > 0 ? `${expiringSoon.toFixed(2)} ${item.unit}` : '-'}</td>
                        `;
                        stockTbody.appendChild(tr);
                    });
                }

                // Draw restock Shopping List
                purchaseTbody.innerHTML = '';
                if (shopping_list.length === 0) {
                    purchaseTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#28a745;font-weight:bold;padding:20px;">All ingredients are well stocked! No purchase needed.</td></tr>';
                } else {
                    shopping_list.forEach(item => {
                        const tr = document.createElement('tr');
                        tr.style.borderBottom = '1px solid #eee';

                        let priorityStyle = 'color:#666;font-weight:bold;';
                        if (item.priority.includes('CRITICAL')) {
                            priorityStyle = 'color:#c42d2d;font-weight:bold;';
                        } else if (item.priority.includes('URGENT')) {
                            priorityStyle = 'color:#d97706;font-weight:bold;';
                        }

                        tr.innerHTML = `
                            <td style="padding:10px 16px; font-weight:600;">${item.name}</td>
                            <td style="padding:10px 16px; text-transform:capitalize;">${item.category.replace('_', ' ')}</td>
                            <td style="padding:10px 16px;">${parseFloat(item.in_stock).toFixed(2)} ${item.unit}</td>
                            <td style="padding:10px 16px;">${parseFloat(item.reorder_level).toFixed(2)} ${item.unit}</td>
                            <td style="padding:10px 16px;">${parseFloat(item.target_quantity).toFixed(2)} ${item.unit}</td>
                            <td style="padding:10px 16px; font-weight:bold; color:#1A3B47; font-size:15px;">${parseFloat(item.purchase_quantity).toFixed(2)} ${item.unit}</td>
                            <td style="padding:10px 16px; ${priorityStyle}">${item.priority}</td>
                        `;
                        purchaseTbody.appendChild(tr);
                    });
                }
            } else {
                showToast(result.message || 'Failed to fetch reports', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load reports data', 'error');
        }
    }

    // Print Report Handler
    window.printInventoryReport = function() {
        const reportContent = document.getElementById('printable-report-area').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Ace Cafe - Inventory Report (${new Date().toLocaleDateString()})</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                    h2 { color: #1A3B47; border-bottom: 2px solid #1A3B47; padding-bottom: 10px; }
                    h4 { color: #1A3B47; margin: 30px 0 10px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                    th, td { padding: 10px 12px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f7f9fa; color: #1A3B47; }
                    .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <h2>ACE CAFE - FOOD INVENTORY REPORT</h2>
                    <button onclick="window.print()" style="padding: 8px 16px; background:#1A3B47; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Print PDF / Print</button>
                </div>
                <div class="header-info">
                    <div><strong>Date Generated:</strong> \${new Date().toLocaleString()}</div>
                    <div><strong>Generated By:</strong> Admin Dashboard</div>
                </div>
                \${reportContent}
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // ==========================================
    // BUFFET PLANNER & STOCK ALLOCATOR
    // ==========================================
    let plannerRecipesMap = {};
    let plannerMenuItems = [];

    async function loadBuffetPlanner() {
        const container = document.getElementById('planner-menu-items-list');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading planner items...</div>';
        
        try {
            // Fetch all ingredients to ensure cachedInventoryItems is fresh
            const itemsRes = await fetch('api/admin_inventory.php?action=get_items');
            const itemsData = await itemsRes.json();
            if (itemsData.status === 'success') {
                cachedInventoryItems = itemsData.data;
            }

            // Fetch all menu items
            const res = await fetch('api/admin_inventory.php?action=get_menu_recipes');
            const result = await res.json();
            if (result.status === 'success') {
                // Filter to only items that have ingredients mapped
                plannerMenuItems = result.data.filter(item => parseInt(item.ingredient_count) > 0);
                
                // Fetch recipes for all these items in parallel
                const recipePromises = plannerMenuItems.map(async (item) => {
                    const recRes = await fetch(`api/admin_inventory.php?action=get_recipe&menu_id=${item.id}`);
                    const recData = await recRes.json();
                    if (recData.status === 'success') {
                        plannerRecipesMap[item.id] = recData.data;
                    }
                });
                
                await Promise.all(recipePromises);
                renderPlannerGrid();
            } else {
                container.innerHTML = '<div style="color:red;text-align:center;">Failed to load menu items.</div>';
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="color:red;text-align:center;">Network error loading planner.</div>';
        }
    }

    function renderPlannerGrid() {
        const container = document.getElementById('planner-menu-items-list');
        if (!container) return;
        container.innerHTML = '';
        
        if (plannerMenuItems.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666; padding:20px 0;">No menu items have recipes configured yet. Set recipes in the Recipes tab first.</p>';
            return;
        }
        
        plannerMenuItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'planner-item-row';
            row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #f0f0f0;';
            
            row.innerHTML = `
                <div style="flex:1;">
                    <strong style="color:#1A3B47;">${item.name}</strong><br>
                    <small style="color:#8c9ea6; text-transform:capitalize;">${item.category}</small>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="number" class="form-input servings-input" data-menu-id="${item.id}" value="0" min="0" oninput="calculateAllocation()" style="width:80px; text-align:center; padding:5px 8px;">
                    <span style="font-size:12px; color:#666; width:60px;">servings</span>
                </div>
            `;
            container.appendChild(row);
        });
        
        calculateAllocation();
    }

    window.calculateAllocation = function() {
        const resultsTbody = document.getElementById('planner-allocation-results');
        if (!resultsTbody) return;
        
        // Map to accumulate total ingredient requirements
        const totals = {};
        
        // Initialize totals for all items in cachedInventoryItems
        cachedInventoryItems.forEach(item => {
            totals[item.id] = {
                id: item.id,
                name: item.name,
                category: item.category,
                unit: item.unit,
                in_stock: parseFloat(item.current_quantity),
                needed: 0.00
            };
        });
        
        // Gather inputs
        let activeSelections = 0;
        const inputs = document.querySelectorAll('.servings-input');
        inputs.forEach(input => {
            const menuId = input.getAttribute('data-menu-id');
            const servings = parseInt(input.value) || 0;
            if (servings > 0) {
                activeSelections++;
                const recipe = plannerRecipesMap[menuId] || [];
                recipe.forEach(ing => {
                    const invId = ing.inventory_item_id;
                    if (totals[invId]) {
                        totals[invId].needed += parseFloat(ing.quantity_required) * servings;
                    }
                });
            }
        });
        
        if (activeSelections === 0) {
            resultsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:15px; color:#666;">Set servings on the left to calculate stock requirements.</td></tr>';
            return;
        }
        
        // Filter and render
        resultsTbody.innerHTML = '';
        
        Object.values(totals).forEach(item => {
            if (item.needed > 0) {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';
                
                const leftover = item.in_stock - item.needed;
                
                let leftoverStr = '';
                let statusStr = '';
                
                if (leftover >= 0) {
                    leftoverStr = `<span style="color:#28a745; font-weight:bold;">+${leftover.toFixed(2)} ${item.unit}</span>`;
                    statusStr = '<span class="badge" style="background:#e8fdf0; color:#28a745; padding:3px 6px; border-radius:4px; font-weight:bold; font-size:11px;">Sufficient Stock</span>';
                } else {
                    const shortage = Math.abs(leftover);
                    leftoverStr = `<span style="color:#c42d2d; font-weight:bold;">-${shortage.toFixed(2)} ${item.unit}</span>`;
                    statusStr = `<span class="badge" style="background:#fbebeb; color:#c42d2d; padding:3px 6px; border-radius:4px; font-weight:bold; font-size:11px;">Buy ${shortage.toFixed(2)} ${item.unit}</span>`;
                }
                
                tr.innerHTML = `
                    <td style="padding:10px 8px; font-weight:600;">${item.name}</td>
                    <td style="padding:10px 8px; text-transform:capitalize;">${item.category.replace('_', ' ')}</td>
                    <td style="padding:10px 8px; font-weight:bold; color:#1A3B47;">${item.needed.toFixed(2)} ${item.unit}</td>
                    <td style="padding:10px 8px;">${item.in_stock.toFixed(2)} ${item.unit}</td>
                    <td style="padding:10px 8px;">${leftoverStr}</td>
                    <td style="padding:10px 8px;">${statusStr}</td>
                `;
                resultsTbody.appendChild(tr);
            }
        });
    };

    window.quickPresetPlanner = function(qty) {
        const inputs = document.querySelectorAll('.servings-input');
        inputs.forEach(input => {
            input.value = qty;
        });
        calculateAllocation();
    };

    window.printBuffetShoppingList = function() {
        const tbody = document.getElementById('planner-allocation-results');
        if (!tbody || tbody.innerText.includes('Set servings')) {
            alert("Please configure planned servings first to calculate shortages!");
            return;
        }

        // Generate print contents
        let tableRows = '';
        let totalShortages = 0;
        
        const totals = {};
        cachedInventoryItems.forEach(item => {
            totals[item.id] = {
                name: item.name,
                category: item.category,
                unit: item.unit,
                in_stock: parseFloat(item.current_quantity),
                needed: 0.00
            };
        });
        
        const inputs = document.querySelectorAll('.servings-input');
        inputs.forEach(input => {
            const menuId = input.getAttribute('data-menu-id');
            const servings = parseInt(input.value) || 0;
            if (servings > 0) {
                const recipe = plannerRecipesMap[menuId] || [];
                recipe.forEach(ing => {
                    const invId = ing.inventory_item_id;
                    if (totals[invId]) {
                        totals[invId].needed += parseFloat(ing.quantity_required) * servings;
                    }
                });
            }
        });
        
        Object.values(totals).forEach(item => {
            if (item.needed > 0) {
                const leftover = item.in_stock - item.needed;
                if (leftover < 0) {
                    totalShortages++;
                    const shortage = Math.abs(leftover);
                    tableRows += `
                        <tr style="border-bottom:1px solid #ddd;">
                           <td style="padding:10px; font-weight:bold;">${item.name}</td>
                           <td style="padding:10px; text-transform:capitalize;">${item.category.replace('_', ' ')}</td>
                           <td style="padding:10px;">${item.in_stock.toFixed(2)} ${item.unit}</td>
                           <td style="padding:10px;">${item.needed.toFixed(2)} ${item.unit}</td>
                           <td style="padding:10px; color:#c42d2d; font-weight:bold; font-size:14px;">${shortage.toFixed(2)} ${item.unit}</td>
                        </tr>
                    `;
                }
            }
        });
        
        if (totalShortages === 0) {
            alert("No shortages detected for the planned buffet! You have enough stock for everything.");
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Buffet Shopping List - Ace Cafe</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 45px; color:#333; }
                    h2 { color:#1A3B47; border-bottom:2px solid #1A3B47; padding-bottom:10px; margin-bottom:5px; }
                    p { margin:5px 0; font-size:14px; color:#666; }
                    table { width:100%; border-collapse:collapse; margin-top:20px; font-size:13px; }
                    th, td { padding:10px 12px; border:1px solid #ddd; text-align:left; }
                    th { background-color:#f7f9fa; color:#1A3B47; }
                    @media print {
                        button { display:none; }
                        body { padding:0; }
                    }
                </style>
            </head>
            <body>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>BUFFET SHOPPING LIST (SHORTAGES)</h2>
                    <button onclick="window.print()" style="padding:8px 16px; background:#1A3B47; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Print / Save PDF</button>
                </div>
                <p><strong>Planned Event Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin-top:15px;">The following ingredients have insufficient stock to satisfy the planned servings. Purchase the quantities listed below:</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Ingredient Name</th>
                            <th>Category</th>
                            <th>Currently In Stock</th>
                            <th>Required for Event</th>
                            <th>Shortage Quantity to Purchase</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // ==========================================
    // INVENTORY STOCK LEVELS CHART
    // ==========================================
    let inventoryChartInstance = null;

    window.renderStockChart = function(items) {
        const container = document.getElementById('inventoryStockChartContainer');
        const ctx = document.getElementById('inventoryStockChart');
        if (!ctx || !container) return;

        if (inventoryChartInstance) {
            inventoryChartInstance.destroy();
            inventoryChartInstance = null;
        }

        const chartCol = document.getElementById('inventoryStockChartCol');
        const tableCol = document.getElementById('inventoryTableCol');

        if (!items || items.length === 0) {
            container.style.display = 'none';
            if (chartCol) chartCol.style.display = 'none';
            if (tableCol) {
                tableCol.className = 'col-12';
            }
            return;
        }
        
        container.style.display = 'block';
        if (chartCol) chartCol.style.display = 'block';
        if (tableCol) {
            tableCol.className = 'col-7';
        }

        // Sort items by fill percentage: current / target
        // Display top 10 items with lowest stock percentage
        const sortedItems = [...items].map(item => {
            const current = parseFloat(item.current_quantity);
            const target = parseFloat(item.target_quantity) || 1.0;
            const pct = Math.min(100, Math.max(0, (current / target) * 100));
            return {
                name: item.name,
                pct: pct,
                current: current,
                target: target,
                unit: item.unit
            };
        }).sort((a, b) => a.pct - b.pct).slice(0, 10);

        const labels = sortedItems.map(item => item.name);
        const dataValues = sortedItems.map(item => item.pct);
        
        const backgroundColors = sortedItems.map(item => {
            if (item.pct <= 25) return 'rgba(196, 45, 45, 0.75)'; // Red
            if (item.pct <= 75) return 'rgba(217, 119, 6, 0.75)'; // Orange
            return 'rgba(40, 167, 69, 0.75)'; // Green
        });
        const borderColors = sortedItems.map(item => {
            if (item.pct <= 25) return '#c42d2d';
            if (item.pct <= 75) return '#d97706';
            return '#28a745';
        });

        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#ffffff' : '#1A3B47';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        inventoryChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stock Fill Level (%)',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 4,
                    maxBarThickness: 24
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const item = sortedItems[index];
                                return ` Fill Level: ${item.pct.toFixed(1)}% (${item.current.toFixed(2)} / ${item.target.toFixed(2)} ${item.unit})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColor,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    };
});

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

            // Redraw inventory stock chart if populated
            if (window.renderStockChart && window.cachedInventoryItems) {
                window.renderStockChart(window.cachedInventoryItems);
            }
        });
    }
});
