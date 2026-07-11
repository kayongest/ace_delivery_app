// Setup loader animation spelling out "ACE CAFE"
anime({
  targets: '.loader-svg .line',
  strokeDashoffset: [250, 0],
  easing: 'easeInOutSine',
  duration: 1500,
  delay: function(el, i) { return i * 150 },
  direction: 'alternate',
  loop: 2,
  complete: function(anim) {
      const loader = document.getElementById('loader');
      if(loader) loader.classList.add('hidden');
  }
});

// // Authentic Coffeehouse Menu Data fetched from API
let menuData = [];


let cart = [];

const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

let currentMenuPage = 1;
const ITEMS_PER_PAGE = 5;
let currentFilteredItems = [];

function renderMenu(items, page = 1) {
    if (!menuGrid) return;
    
    currentFilteredItems = items;
    currentMenuPage = page;
    
    menuGrid.innerHTML = '';
    const paginationContainer = document.getElementById('pagination-container');
    if(paginationContainer) paginationContainer.innerHTML = '';
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<div class="no-items">No items found in this category.</div>';
        return;
    }
    
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    
    if (currentMenuPage > totalPages) currentMenuPage = totalPages;
    if (currentMenuPage < 1) currentMenuPage = 1;
    
    const startIndex = (currentMenuPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = items.slice(startIndex, endIndex);
    
    pageItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card menu-card glass';
        card.setAttribute('onclick', `openModal(${item.id})`);
        
        // Use a default image if none provided
        const imgSrc = item.image ? item.image : "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22282%22%20height%3D%22160%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20282%20160%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_19ed49ba61a%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_19ed49ba61a%22%3E%3Crect%20width%3D%22282%22%20height%3D%22160%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22105.1937484741211%22%20y%3D%2286.24000034332275%22%3E282x160%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
        
        const isFav = (window.userFavorites || []).includes(parseInt(item.id));
        const heartClass = isFav ? 'ph-fill ph-heart' : 'ph ph-heart';
        const heartColor = isFav ? 'var(--brand-red)' : '#ffffff';

        card.innerHTML = `
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); border-radius: 50%; padding: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;" onclick="event.stopPropagation(); toggleFavorite(${item.id}, event)">
                <i class="${heartClass}" style="color: ${heartColor}; font-size: 18px; transition: color 0.3s ease;"></i>
            </div>
            <img class="card-img-top card-img" alt="${item.name}" src="${imgSrc}" style="height: 160px; width: 100%; display: block; object-fit: cover;">
            <div class="card-body" style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1;">
              <h5 class="card-title" style="margin-bottom: 2px;">${item.name}</h5>
              <div style="font-size: 12px; color: gold; margin-bottom: 8px;">
                  ${item.avg_rating > 0 ? '★ ' + parseFloat(item.avg_rating).toFixed(1) + ' <span style="color:#777">(' + item.review_count + ')</span>' : '<span style="color:#777">No reviews yet</span>'}
              </div>
              <p class="card-text card-desc">${item.description ? item.description.substring(0, 75) + '...' : ''}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; border-top: 1px dashed var(--border-color); padding-top: 15px;">
                  <p class="item-price" style="margin: 0; font-size: 19px; font-weight: 800;">RWF ${item.price}</p>
                  <button class="add-btn" onclick="event.stopPropagation(); addToCart(${item.id}, event)">Add</button>
              </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });

    if (pageItems.length > 0) {
        anime({
            targets: '.menu-card',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(50),
            easing: 'easeOutQuad',
            duration: 400
        });
    }

    if (totalPages > 1 && paginationContainer) {
        for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = 'pagination-dot' + (i === currentMenuPage ? ' active' : '');
            dot.onclick = () => {
                renderMenu(currentFilteredItems, i);
                document.getElementById('menu-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            paginationContainer.appendChild(dot);
        }
    }
}

function getServingSuggestion(item) {
    if (!item) return '';
    const name = item.name.toLowerCase();
    const category = item.category.toLowerCase();
    
    if (name.includes('mashed cheese potatoes')) {
        return 'Fried Chicken Wings';
    } else if (name.includes('beef stir fry')) {
        return 'Chapati';
    } else if (name.includes('french fries')) {
        return 'Fried Chicken Wings';
    } else if (name.includes('chicken wings') || name.includes('chicken leg') || name.includes('brochette')) {
        return 'French Fries';
    } else if (category === 'coffee' || category === 'tea') {
        return 'Samosa (beef)';
    } else if (category === 'burgers' || category === 'pizza' || category === 'sandwiches') {
        return 'French Fries';
    } else if (category === 'omelettes') {
        return 'African tea';
    } else if (category === 'sides') {
        return 'Ace Burger';
    }
    return '';
}

function renderCart() {
    if (cartCountElement) {
        cartCountElement.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Update dynamic header count
    const cartHeaderCountElement = document.getElementById('cart-header-count');
    if (cartHeaderCountElement) {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartHeaderCountElement.innerText = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
    }

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
            if (cartTotalElement) cartTotalElement.innerText = "RWF 0";
            const cartSubtotalElement = document.getElementById('cart-subtotal');
            if (cartSubtotalElement) cartSubtotalElement.innerText = "RWF 0";
            return;
        }
        
        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const suggestion = getServingSuggestion(item);
            const suggestionHtml = suggestion 
                ? `<span style="font-size: 11px; opacity: 0.8; display: block; margin-top: 2px; color: var(--brand-red); font-weight: 500;">Normally served with ${suggestion}</span>` 
                : '';
                
            const itemPriceDisplay = parseInt(item.price) === 0 
                ? '<span style="color: #2ed573; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">FREE</span>' 
                : `RWF ${item.price}`;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item-modern';
            cartItem.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%;">
                    <img src="${item.image || 'images/ace_cafe.png'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="flex-grow: 1; display: flex; flex-direction: column;">
                        <span style="font-weight: 600; font-size: 14px; color: var(--text-color);">${item.name}</span>
                        <span style="color: var(--brand-red); font-weight: 700; font-size: 13px; margin-top: 2px;">${itemPriceDisplay}</span>
                        ${suggestionHtml}
                    </div>
                    <div style="display: flex; align-items: center; background: rgba(122, 28, 36, 0.08); border-radius: 8px; padding: 4px; border: 1px solid rgba(122, 28, 36, 0.15); margin-left: 10px;">
                        <button onclick="event.stopPropagation(); updateQuantity(${index}, ${item.quantity - 1})" style="background: none; border: none; color: var(--brand-red); font-weight: bold; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; padding: 0;">-</button>
                        <span style="font-weight: 700; font-size: 13px; color: var(--text-color); min-width: 20px; text-align: center; display: inline-block;">${item.quantity}</span>
                        <button onclick="event.stopPropagation(); updateQuantity(${index}, ${item.quantity + 1})" style="background: none; border: none; color: var(--brand-red); font-weight: bold; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; padding: 0;">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Smart Upsells Logic
        let cartCategories = cart.map(item => item.category);
        let recommendedItems = [];
        
        if (cartCategories.includes('burgers') || cartCategories.includes('pizza') || cartCategories.includes('sandwiches')) {
            recommendedItems = menuData.filter(i => (i.category === 'sides' || i.category === 'iced' || i.category === 'smoothies' || i.category === 'shakes') && !cart.find(c => c.id === i.id));
        } else if (cartCategories.includes('coffee') || cartCategories.includes('tea') || cartCategories.includes('iced') || cartCategories.includes('smoothies')) {
            recommendedItems = menuData.filter(i => (i.category === 'sides' || i.category === 'omelettes') && !cart.find(c => c.id === i.id));
        }

        if (recommendedItems.length > 0) {
            const upsellItem = recommendedItems[Math.floor(Math.random() * Math.min(3, recommendedItems.length))];
            
            const upsellDiv = document.createElement('div');
            upsellDiv.style.cssText = "background: rgba(122, 28, 36, 0.05); padding: 10px; border-radius: 8px; border: 1px solid var(--brand-red); margin-top: 15px;";
            upsellDiv.innerHTML = `
                <p style="font-size: 12px; font-weight: bold; color: var(--brand-red); margin-bottom: 5px;">Frequently bought together:</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: var(--text-color);">${upsellItem.name} <span style="opacity:0.7">(RWF ${upsellItem.price})</span></span>
                    <button onclick="event.stopPropagation(); addToCart(${upsellItem.id})" style="background: var(--brand-red); color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: 0.2s;">Add</button>
                </div>
            `;
            cartItemsContainer.appendChild(upsellDiv);
        }
        
        // Condiment Extras Section
        const dbExtras = menuData.filter(i => i.category === 'extras');
        if (dbExtras.length > 0) {
            const extrasDiv = document.createElement('div');
            extrasDiv.style.cssText = "border-top: 1px dashed rgba(122, 28, 36, 0.2); margin-top: 15px; padding-top: 15px;";
            
            const extrasGridHtml = dbExtras.map(extra => {
                const priceDisplay = parseInt(extra.price) === 0 
                    ? '<span style="color: #2ed573; font-weight: bold;">FREE</span>' 
                    : extra.price;
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(122, 28, 36, 0.05); border: 1px solid rgba(122, 28, 36, 0.1); padding: 6px 10px; border-radius: 6px; font-size: 12px;">
                        <span style="color: var(--text-color); font-weight: 500;">${extra.name} <span style="opacity: 0.7; font-size: 10px;">(${priceDisplay})</span></span>
                        <button onclick="event.stopPropagation(); addToCart(${extra.id})" style="background: none; border: none; color: var(--brand-red); font-weight: bold; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;">+</button>
                    </div>
                `;
            }).join('');
            
            extrasDiv.innerHTML = `
                <p style="font-size: 12px; font-weight: 700; color: var(--brand-red); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Add Extras:</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    ${extrasGridHtml}
                </div>
            `;
            cartItemsContainer.appendChild(extrasDiv);
        }
        
        // Loyalty points UI update
        const loyaltyContainer = document.getElementById('cart-loyalty-container');
        const userPointsLabel = document.getElementById('cart-user-points');
        if (loyaltyContainer && userPointsLabel) {
            if (currentUser && currentUser.points > 0) {
                loyaltyContainer.style.display = 'block';
                userPointsLabel.textContent = `${currentUser.points} pts`;
            } else {
                loyaltyContainer.style.display = 'none';
            }
        }

        // Discount calculations
        let couponDiscount = 0;
        if (window.appliedCoupon) {
            if (total < window.appliedCoupon.min_order_amount) {
                window.appliedCoupon = null;
                showToast('Applied coupon removed - Minimum order amount no longer met.', 'error');
            } else {
                if (window.appliedCoupon.type === 'percent') {
                    couponDiscount = Math.floor(total * (window.appliedCoupon.value / 100));
                } else {
                    couponDiscount = window.appliedCoupon.value;
                }
            }
        }

        let loyaltyDiscount = 0;
        const redeemCheckbox = document.getElementById('redeem-points-checkbox');
        if (redeemCheckbox && redeemCheckbox.checked && currentUser && currentUser.points > 0) {
            const remainingTotal = Math.max(0, total - couponDiscount);
            const maxPointsRedeemable = Math.ceil(remainingTotal / 10);
            const pointsToRedeem = Math.min(currentUser.points, maxPointsRedeemable);
            loyaltyDiscount = pointsToRedeem * 10;
        }

        const totalDiscount = couponDiscount + loyaltyDiscount;
        const finalTotal = Math.max(0, total - totalDiscount);

        const cartSubtotalElement = document.getElementById('cart-subtotal');
        if (cartSubtotalElement) {
            cartSubtotalElement.innerText = `RWF ${total}`;
        }
        
        const discountRow = document.getElementById('cart-discount-row');
        const discountVal = document.getElementById('cart-discount');
        if (discountRow && discountVal) {
            if (totalDiscount > 0) {
                discountRow.style.display = 'flex';
                discountVal.innerText = `-RWF ${totalDiscount}`;
            } else {
                discountRow.style.display = 'none';
            }
        }

        if (cartTotalElement) {
            cartTotalElement.innerText = `RWF ${finalTotal}`;
        }
    }
}

window.updateQuantity = (index, newQty) => {
    if (newQty <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQty;
    }
    renderCart();
};

window.addToCart = (id, btnEvent) => {
    const item = menuData.find(i => i.id === id);
    if (item) {
        const existingItem = cart.find(i => i.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        renderCart();
        
        // Fly-to-cart animation
        if (btnEvent) {
            const btn = btnEvent.target;
            const card = btn.closest('.menu-card') || btn.closest('.modal-content');
            if (card) {
                const img = card.querySelector('.card-img') || card.querySelector('#modal-img');
                const cartIcon = document.getElementById('cart-trigger');
                
                if (img && cartIcon) {
                    const clone = img.cloneNode();
                    const rect = img.getBoundingClientRect();
                    const cartRect = cartIcon.getBoundingClientRect();
                    
                    clone.style.position = 'fixed';
                    clone.style.top = rect.top + 'px';
                    clone.style.left = rect.left + 'px';
                    clone.style.width = rect.width + 'px';
                    clone.style.height = rect.height + 'px';
                    clone.style.zIndex = '9999';
                    clone.style.borderRadius = '8px';
                    clone.style.objectFit = 'cover';
                    document.body.appendChild(clone);
                    
                    anime({
                        targets: clone,
                        top: cartRect.top + (cartRect.height / 2),
                        left: cartRect.left + (cartRect.width / 2),
                        width: 20,
                        height: 20,
                        opacity: 0.5,
                        easing: 'easeInCubic',
                        duration: 600,
                        complete: function() {
                            clone.remove();
                            cartIcon.classList.add('pulse');
                            setTimeout(() => cartIcon.classList.remove('pulse'), 300);
                        }
                    });
                }
            }
        } else {
            const trigger = document.getElementById('cart-trigger');
            if (trigger) {
                trigger.classList.add('pulse');
                setTimeout(() => trigger.classList.remove('pulse'), 300);
            }
        }
    }
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
}

// Category Tab Filtering Logic
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;
        if (category === 'all') {
            renderMenu(menuData);
        } else if (category === 'favorites') {
            const filtered = menuData.filter(i => (window.userFavorites || []).includes(parseInt(i.id)));
            renderMenu(filtered);
        } else {
            const filtered = menuData.filter(i => i.category === category);
            renderMenu(filtered);
        }
    });
});

// Search bar filtering logic
const searchInputs = document.querySelectorAll('.search-bar input, .hero-search-bar input');
searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Sync search inputs
        searchInputs.forEach(inp => {
            if (inp !== e.target) inp.value = e.target.value;
        });

        // Filter menuData
        const filtered = menuData.filter(item => 
            (item.name || '').toLowerCase().includes(query) || 
            (item.description || '').toLowerCase().includes(query)
        );
        renderMenu(filtered);
    });
});

// Sidebar Cart Slideout Logic
const cartTrigger = document.getElementById('cart-trigger');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');

if (cartTrigger && cartSidebar) {
    cartTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        cartSidebar.classList.toggle('open');
    });
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('open') && !cartSidebar.contains(e.target) && e.target !== cartTrigger) {
            cartSidebar.classList.remove('open');
        }
    });
}

// Item Modal Logic
const modal = document.getElementById('item-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalAddBtn = document.getElementById('modal-add-btn');

let currentModalItemId = null;

// Fetch and render reviews
async function fetchAndRenderReviews(menuId) {
    const list = document.getElementById('modal-reviews-list');
    const avgEl = document.getElementById('modal-rating-avg');
    if(list) list.innerHTML = '<div style="text-align:center; padding:10px;">Loading...</div>';
    
    try {
        const res = await fetch(`api/reviews.php?menu_id=${menuId}&_t=${Date.now()}`);
        const result = await res.json();
        if (result.status === 'success') {
            const reviews = result.data;
            if (reviews.length === 0) {
                if(list) list.innerHTML = '<div>No reviews yet. Be the first!</div>';
                if(avgEl) avgEl.innerText = '0.0';
            } else {
                let total = 0;
                if(list) list.innerHTML = reviews.map(r => {
                    total += parseInt(r.rating);
                    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
                    const d = new Date(r.created_at).toLocaleDateString();
                    const photoHtml = r.photo 
                        ? `<div style="margin-top: 8px;"><a href="${r.photo}" target="_blank"><img src="${r.photo}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></a></div>` 
                        : '';
                    return `<div style="margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color:white; font-size:12px;">${r.customer_name}</strong>
                            <span style="color:gold; font-size:12px;">${stars}</span>
                        </div>
                        <div style="font-size:11px; color:#888;">${d}</div>
                        <div style="font-size:13px; margin-top:3px;">${r.review_text || ''}</div>
                        ${photoHtml}
                    </div>`;
                }).join('');
                if(avgEl) avgEl.innerText = (total / reviews.length).toFixed(1);
            }
        }
    } catch(e) {
        if(list) list.innerHTML = '<div style="color:red;">Error loading reviews</div>';
    }
}

// Review form toggle
const leaveReviewBtn = document.getElementById('leave-review-btn');
const reviewForm = document.getElementById('review-form');
const starsElements = document.querySelectorAll('.star-btn');
const ratingVal = document.getElementById('review-rating-val');

if (leaveReviewBtn) {
    leaveReviewBtn.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Please sign in to leave a review', 'error');
            return;
        }
        reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
    });
}

starsElements.forEach(star => {
    star.addEventListener('click', (e) => {
        const val = parseInt(e.target.dataset.val);
        ratingVal.value = val;
        starsElements.forEach(s => {
            if (parseInt(s.dataset.val) <= val) s.style.color = 'gold';
            else s.style.color = '#555';
        });
    });
});

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = ratingVal.value;
        const text = document.getElementById('review-text-input').value;
        if (rating == 0) {
            showToast('Please select a star rating', 'error');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('menu_id', currentModalItemId);
            formData.append('rating', rating);
            formData.append('review_text', text);
            const fileInput = document.getElementById('review-photo-input');
            if (fileInput && fileInput.files[0]) {
                formData.append('photo', fileInput.files[0]);
            }

            const res = await fetch('api/reviews.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.status === 'success') {
                showToast('Review submitted!', 'success');
                reviewForm.reset();
                starsElements.forEach(s => s.style.color = '#555');
                ratingVal.value = 0;
                reviewForm.style.display = 'none';
                fetchAndRenderReviews(currentModalItemId);
                initApp(); // Refresh menu ratings
            } else {
                showToast(result.message, 'error');
            }
        } catch(e) {
            showToast('Failed to submit review', 'error');
        }
    });
}

window.openModal = (id) => {
    currentModalItemId = id;
    const item = menuData.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modal-title').innerText = item.name;
    document.getElementById('modal-desc').innerText = item.description;
    document.getElementById('modal-price').innerText = `RWF ${item.price}`;
    document.getElementById('modal-img').src = item.image;
    
    const avg = parseFloat(item.avg_rating || 0).toFixed(1);
    const avgEl = document.getElementById('modal-rating-avg');
    if(avgEl) avgEl.innerText = avg;
    
    fetchAndRenderReviews(id);
    
    modalAddBtn.onclick = (e) => {
        addToCart(item.id, e);
        closeModal();
    };
    
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initial Render
async function initApp() {
    const grid = document.getElementById('menu-grid');
    if (grid) {
        grid.innerHTML = Array(6).fill('<div class="skeleton skeleton-card"></div>').join('');
    }
    try {
        const response = await fetch(`api/menu.php?_t=${new Date().getTime()}`);
        
        // Artificial delay for local testing so skeleton loaders are visible
        await new Promise(r => setTimeout(r, 600));
        
        if (response.ok) {
            menuData = await response.json();
        } else {
            console.error('Failed to fetch menu data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    renderMenu(menuData);
    renderCart();
}

initApp();
// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const navThemeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const navThemeIcon = document.getElementById('theme-icon');

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
        if (navThemeIcon) navThemeIcon.classList.replace('ph-moon', 'ph-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
        if (navThemeIcon) navThemeIcon.classList.replace('ph-sun', 'ph-moon');
        localStorage.setItem('theme', 'light');
    }
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    setTheme(isDark ? 'light' : 'dark');
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}
if (navThemeToggleBtn) {
    navThemeToggleBtn.addEventListener('click', toggleTheme);
}

// Hero Carousel Logic
const carouselSlides = document.querySelectorAll('.carousel-slide');
if (carouselSlides.length > 0) {
    let isOrderProcessing = false;

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
            color: var(--text-color);
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
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    let currentSlide = 0;
    setInterval(() => {
        carouselSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % carouselSlides.length;
        carouselSlides[currentSlide].classList.add('active');
    }, 5000); // Change image every 5 seconds
}

// Checkout Logic
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModalBtn = document.getElementById('close-checkout-modal');
const checkoutForm = document.getElementById('checkout-form');

if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", "error");
            return;
        }
        
        if (!currentUser) {
            showToast("Please sign in or register to checkout", "error");
            if (cartSidebar) cartSidebar.classList.remove('open');
            document.getElementById('auth-modal').classList.remove('hidden');
            return;
        }
        
        checkoutModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (cartSidebar) cartSidebar.classList.remove('open');
        
        populateCheckoutAddresses();
        initCheckoutMap();
    });
}

function closeCheckoutModal() {
    if (checkoutModal) {
        checkoutModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

if (closeCheckoutModalBtn) {
    closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
}

// Payment Tabs Logic
const paymentTabs = document.querySelectorAll('.payment-tab');
const paymentMethodInput = document.getElementById('checkout-payment-method');
const momoContainer = document.getElementById('payment-momo-container');
const cardContainer = document.getElementById('payment-card-container');
const codContainer = document.getElementById('payment-cod-container');

if (paymentTabs.length > 0) {
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            paymentTabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderColor = 'rgba(255,255,255,0.2)';
            });
            tab.classList.add('active');
            tab.style.borderColor = 'var(--brand-red)';
            
            const method = tab.dataset.method;
            if(paymentMethodInput) paymentMethodInput.value = method;
            
            if(momoContainer) momoContainer.style.display = 'none';
            if(cardContainer) cardContainer.style.display = 'none';
            if(codContainer) codContainer.style.display = 'none';
            
            if ((method === 'momo' || method === 'airtel') && momoContainer) momoContainer.style.display = 'block';
            else if (method === 'card' && cardContainer) cardContainer.style.display = 'block';
            else if (method === 'cod' && codContainer) codContainer.style.display = 'block';
        });
    });
}

// Card input formatting mock
const cardInput = document.getElementById('card-number');
const cardDisplay = document.getElementById('card-number-display');
const chkNameInput = document.getElementById('checkout-name');
const cardNameDisplay = document.getElementById('card-name-display');
const cardExpiryInput = document.getElementById('card-expiry');
const cardExpiryDisplay = document.getElementById('card-expiry-display');

if (cardInput) {
    cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = formatted;
        if(cardDisplay) cardDisplay.innerText = formatted || '•••• •••• •••• ••••';
    });
}
if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
        e.target.value = val;
        if(cardExpiryDisplay) cardExpiryDisplay.innerText = val || 'MM/YY';
    });
}
if (chkNameInput && cardNameDisplay) {
    chkNameInput.addEventListener('input', (e) => {
        cardNameDisplay.innerText = e.target.value || 'Card Holder';
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value;
        const phone = document.getElementById('checkout-phone').value;
        const address = document.getElementById('checkout-address').value;
        
        const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'cod';
        const momoPhone = document.getElementById('momo-phone');
        const cardNum = document.getElementById('card-number');
        
        // Basic validations
        if ((paymentMethod === 'momo' || paymentMethod === 'airtel') && momoPhone && momoPhone.value.length < 8) {
            showToast('Please enter a valid Mobile Money number', 'error');
            return;
        }
        if (paymentMethod === 'card' && cardNum && cardNum.value.length < 19) {
            showToast('Please enter a valid card number', 'error');
            return;
        }

        const redeemPointsCheckbox = document.getElementById('redeem-points-checkbox');
        const orderData = {
            name,
            phone,
            address,
            payment_method: paymentMethod,
            coupon_code: window.appliedCoupon ? window.appliedCoupon.code : null,
            redeem_points: (redeemPointsCheckbox && redeemPointsCheckbox.checked) ? 1 : 0,
            latitude: document.getElementById('checkout-lat') ? document.getElementById('checkout-lat').value : null,
            longitude: document.getElementById('checkout-lng') ? document.getElementById('checkout-lng').value : null,
            items: cart.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity
            }))
        };
        
        try {
            const response = await fetch('api/checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast('Your order has been accepted - Please wait for approval!', 'success');
                cart = [];
                window.appliedCoupon = null; // Clear applied coupon
                const promoInput = document.getElementById('cart-promo-input');
                if (promoInput) promoInput.value = '';
                const redeemPointsCheckbox = document.getElementById('redeem-points-checkbox');
                if (redeemPointsCheckbox) redeemPointsCheckbox.checked = false;
                renderCart();
                checkoutForm.reset();
                closeCheckoutModal();
                await checkAuth(); // Refresh orders list
                
                // Auto-open the My Orders modal
                setTimeout(() => {
                    const viewOrdersBtn = document.getElementById('view-orders-btn');
                    if (viewOrdersBtn) {
                        viewOrdersBtn.click();
                    } else {
                        document.getElementById('my-orders-modal').classList.remove('hidden');
                    }
                }, 500);
            } else {
                alert('Error placing order: ' + result.message);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to place order. Please try again.');
        }
    });
}

// Auth Logic
let currentUser = null;

async function checkAuth() {
    try {
        const res = await fetch(`api/auth/me.php?_t=${new Date().getTime()}`);
        const result = await res.json();
        
        const authArea = document.getElementById('auth-nav-area');
        if (result.status === 'success') {
            currentUser = result.user;
            
            // Fetch favorites
            try {
                const favRes = await fetch('api/favorites.php');
                const favData = await favRes.json();
                if (favData.status === 'success') {
                    window.userFavorites = favData.data.map(id => parseInt(id));
                    if (document.getElementById('menu-grid')) {
                        renderMenu(currentFilteredItems, currentMenuPage); 
                    }
                }
            } catch(e) {}
            
            // Auto-fill checkout if elements exist
            const chkName = document.getElementById('checkout-name');
            const chkPhone = document.getElementById('checkout-phone');
            const chkAddress = document.getElementById('checkout-address');
            if (chkName && !chkName.value) chkName.value = currentUser.full_name || '';
            if (chkPhone && !chkPhone.value) chkPhone.value = currentUser.phone || '';
            if (chkAddress && !chkAddress.value) chkAddress.value = currentUser.address || '';

            if (authArea) {
                const displayName = currentUser.full_name ? currentUser.full_name.split(' ')[0] : (currentUser.email ? currentUser.email.split('@')[0] : 'User');
                const avatar = currentUser.profile_image ? `<img src="${currentUser.profile_image}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid var(--brand-red);">` : `<i class="ph ph-user-check"></i>`;
                authArea.innerHTML = `
                    <div class="user-dropdown" style="position: relative;">
                        <button id="my-account-btn" class="action-link" style="background: none; border: none; font-family: inherit; font-size: inherit; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            ${avatar}
                            <span>Hi, ${displayName}</span>
                        </button>
                        <div id="user-menu" class="glass" style="position: absolute; top: 100%; right: 0; min-width: 150px; border-radius: 8px; overflow: hidden; display: none; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 10px; z-index: 100;">
                            <div style="padding: 10px 15px; border-bottom: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02);">
                                <span>Ace Points:</span>
                                <strong style="color: var(--brand-red); font-size: 14px;">${currentUser.points || 0}</strong>
                            </div>
                            <button id="view-profile-btn" style="padding: 10px 15px; text-align: left; background: none; border: none; color: var(--text-dark); cursor: pointer; border-bottom: 1px solid var(--border-color);">My Profile</button>
                            <button id="view-orders-btn" style="padding: 10px 15px; text-align: left; background: none; border: none; color: var(--text-dark); cursor: pointer; border-bottom: 1px solid var(--border-color);">My Orders</button>
                            ${(currentUser.role === 'admin' || currentUser.role === 'staff') ? '<a href="admin.php" style="padding: 10px 15px; text-decoration: none; color: var(--text-dark); border-bottom: 1px solid var(--border-color);">Dashboard</a>' : ''}
                            <button id="logout-btn" style="padding: 10px 15px; text-align: left; background: none; border: none; color: var(--brand-red); cursor: pointer;">Logout</button>
                        </div>
                    </div>
                `;
                
                document.getElementById('my-account-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const menu = document.getElementById('user-menu');
                    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
                });
                
                const logoutBtn = document.getElementById('logout-btn');
                if(logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        await fetch('api/auth/logout.php');
                        showToast('Logged out successfully');
                        // Reset checkout form if it was auto-filled
                        const chkName = document.getElementById('checkout-name');
                        if(chkName) document.getElementById('checkout-form').reset();
                        
                        // Re-render auth nav as logged out instead of full reload
                        authArea.innerHTML = `
                            <button id="open-auth-btn" class="action-link" style="background: none; border: none; font-family: inherit; font-size: inherit; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                                <i class="ph ph-user"></i>
                                <span>Sign In</span>
                            </button>
                        `;
                        document.getElementById('open-auth-btn').addEventListener('click', () => {
                            document.getElementById('auth-modal').classList.remove('hidden');
                        });
                        
                        currentUser = null;
                    });
                }
                
                const profileBtn = document.getElementById('view-profile-btn');
                if(profileBtn) {
                    profileBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openProfileModal();
                        document.getElementById('user-menu').style.display = 'none';
                    });
                }
                
                let myOrdersInterval = null;
                document.getElementById('view-orders-btn').addEventListener('click', async () => {
                    // Fetch fresh orders to prevent requiring a hard refresh
                    try {
                        const freshRes = await fetch(`api/auth/me.php?_t=${new Date().getTime()}`);
                        const freshData = await freshRes.json();
                        if (freshData.status === 'success') {
                            renderMyOrders(freshData.orders);
                        } else {
                            renderMyOrders(result.orders);
                        }
                    } catch (e) {
                        renderMyOrders(result.orders);
                    }
                    
                    document.getElementById('my-orders-modal').classList.remove('hidden');
                    document.body.style.overflow = 'hidden';

                    // Start Live Polling for My Orders
                    if (myOrdersInterval) clearInterval(myOrdersInterval);
                    myOrdersInterval = setInterval(async () => {
                        if (document.getElementById('my-orders-modal').classList.contains('hidden')) {
                            clearInterval(myOrdersInterval);
                            return;
                        }
                        try {
                            const pollRes = await fetch(`api/auth/me.php?_t=${Date.now()}`);
                            const pollData = await pollRes.json();
                            if (pollData.status === 'success') {
                                renderMyOrders(pollData.orders);
                            }
                        } catch(e) {}
                    }, 5000);
                });
            }
        } else {
            currentUser = null;
            if (authArea) {
                authArea.innerHTML = `
                    <button id="open-auth-btn" class="action-link" style="background: none; border: none; font-family: inherit; font-size: inherit; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i class="ph ph-user"></i>
                        <span>Sign In</span>
                    </button>
                `;
                document.getElementById('open-auth-btn').addEventListener('click', () => {
                    document.getElementById('auth-modal').classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                });
            }
        }
    } catch(e) {
        console.error("Auth check failed", e);
    }
}

// Close User Menu on outside click
document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu');
    if (menu && !menu.contains(e.target) && e.target.id !== 'my-account-btn' && !e.target.closest('#my-account-btn')) {
        menu.style.display = 'none';
    }
});

// Profile Modal Logic
window.openProfileModal = function() {
    if (!currentUser) return;
    const modal = document.getElementById('profile-modal');
    document.getElementById('profile-name').value = currentUser.full_name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-address').value = currentUser.address || '';
    document.getElementById('profile-points-val').textContent = currentUser.points || 0;
    
    const preview = document.getElementById('profile-preview-img');
    const placeholder = document.getElementById('profile-placeholder-img');
    if (currentUser.profile_image) {
        preview.src = currentUser.profile_image;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.style.opacity = '1', 10);
    const tabInfo = document.getElementById('profile-tab-info');
    if (tabInfo) tabInfo.click();
};

window.closeProfileModal = function() {
    const modal = document.getElementById('profile-modal');
    modal.style.opacity = '0';
    setTimeout(() => modal.classList.add('hidden'), 300);
};

const closeProfileBtn = document.getElementById('close-profile-btn');
if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileModal);

const closeProfileBtnTop = document.getElementById('close-profile-btn-top');
if (closeProfileBtnTop) closeProfileBtnTop.addEventListener('click', closeProfileModal);

const profileAvatarTrigger = document.getElementById('profile-avatar-trigger');
const profileImgInput = document.getElementById('profile-image-input');
if (profileAvatarTrigger && profileImgInput) {
    profileAvatarTrigger.addEventListener('click', () => {
        profileImgInput.click();
    });
}

if (profileImgInput) {
    profileImgInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('profile-preview-img');
                preview.src = e.target.result;
                preview.style.display = 'block';
                document.getElementById('profile-placeholder-img').style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });
}

const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('profile-name').value);
        formData.append('phone', document.getElementById('profile-phone').value);
        formData.append('address', document.getElementById('profile-address').value);
        
        const fileInput = document.getElementById('profile-image-input');
        if (fileInput.files[0]) {
            formData.append('profile_image', fileInput.files[0]);
        }

        try {
            const res = await fetch('api/auth/profile.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.status === 'success') {
                showToast('Profile updated successfully!');
                closeProfileModal();
                checkAuth(); // update DOM
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('Error updating profile');
        }
    });
}

// Render My Orders
function renderMyOrders(orders) {
    window.customerOrders = orders;
    const list = document.getElementById('my-orders-list');
    if (!list) return;
    
    if (orders.length === 0) {
        list.innerHTML = '<p style="color: var(--text-color);">You have no past orders.</p>';
        return;
    }
    
    list.innerHTML = orders.map(order => {
        const itemsList = order.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ');
        const date = new Date(order.created_at).toLocaleString();
        
        let percent = 0;
        let displayStatus = order.status;
        if(order.status === 'pending') percent = 0;
        else if(order.status === 'preparing') percent = 33;
        else if(order.status === 'complete_awaiting_pickup') { percent = 66; displayStatus = 'ready'; }
        else if(order.status === 'delivered') percent = 100;
        else if(order.status === 'cancelled') percent = 100;

        const isCancelled = order.status === 'cancelled';
        let barColor = 'var(--accent-gold)';
        if (isCancelled) {
            barColor = '#ff4d4f';
        } else if (order.status === 'pending') {
            barColor = '#E7DDCF';
        } else if (order.status === 'preparing') {
            barColor = '#8A6F5A';
        } else if (order.status === 'complete_awaiting_pickup') {
            barColor = '#C89B3C';
        } else if (order.status === 'delivered') {
            barColor = '#4F6F52';
        }
        
        const statusText = isCancelled ? 'CANCELLED' : displayStatus.replace(/_/g, ' ').toUpperCase();

        const isPaid = order.payment_status === 'paid';
        const payText = isPaid ? 'PAID' : 'UNPAID';
        const payBg = isPaid ? 'rgba(79, 111, 82, 0.1)' : 'transparent';
        const payColor = isPaid ? '#4F6F52' : 'var(--text-color)';
        const payBorder = isPaid ? '1px solid #4F6F52' : '1px solid var(--border-color)';

        let actionBtn = '';
        if (order.status === 'delivered' || order.status === 'cancelled') {
            actionBtn = `<a href="receipt.php?id=${order.id}" target="_blank" style="padding: 6px 12px; background: transparent; color: var(--text-color); text-decoration: none; border-radius: 4px; font-size: 12px; border: 1px solid var(--border-color); font-weight: 500;">View Receipt</a>`;
        } else {
            actionBtn = `<a href="track_order.php?id=${order.id}" target="_blank" style="padding: 6px 12px; background: var(--brand-red); color: white; text-decoration: none; border-radius: 4px; font-size: 12px; border: 1px solid var(--brand-red); font-weight: 600; box-shadow: 0 2px 8px rgba(122, 28, 36, 0.15);">Track Live</a>`;
        }

        return `
            <div style="background: var(--bg-card); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                    <strong style="color: var(--text-color);">Order #${order.id}</strong>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="background: ${payBg}; color: ${payColor}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; border: ${payBorder};">${payText}</span>
                        <span style="background: ${barColor}; color: ${order.status === 'pending' ? '#111' : 'white'}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">${statusText}</span>
                    </div>
                </div>
                <div style="color: var(--text-color); font-size: 14px; margin-bottom: 15px; opacity: 0.9;">${itemsList}</div>
                
                <div style="margin-bottom: 20px; padding: 0 5px;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-color); margin-bottom: 6px; opacity: 0.7; text-transform: uppercase; font-weight: bold;">
                        <span style="width: 25%; text-align: left;">Pending</span>
                        <span style="width: 25%; text-align: center;">Preparing</span>
                        <span style="width: 25%; text-align: center;">Ready</span>
                        <span style="width: 25%; text-align: right;">Delivered</span>
                    </div>
                    <div style="background: rgba(128,128,128,0.2); height: 5px; border-radius: 3px; position: relative;">
                        <div style="background: ${barColor}; height: 100%; border-radius: 3px; width: ${percent}%; transition: width 0.5s ease; position: relative;">
                            <div style="position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); width: 12px; height: 12px; background: ${barColor}; border-radius: 50%; border: 2px solid var(--bg-card); box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-color);">
                    <div style="opacity: 0.8;">
                        <span style="display: block; margin-bottom: 3px;">${date}</span>
                        <strong>RWF ${order.total_amount}</strong>
                    </div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

// Auth Modal Logic
const authModal = document.getElementById('auth-modal');
const closeAuthBtn = document.getElementById('close-auth-modal');
if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        document.body.style.overflow = '';
    });
}

// My Orders Modal Logic
const myOrdersModal = document.getElementById('my-orders-modal');
const closeMyOrdersBtn = document.getElementById('close-my-orders-modal');
if (closeMyOrdersBtn) {
    closeMyOrdersBtn.addEventListener('click', () => {
        myOrdersModal.classList.add('hidden');
        document.body.style.overflow = '';
    });
}

// Tabs in Auth Modal
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('login-form');
const formRegister = document.getElementById('register-form');

if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabLogin.style.borderBottomColor = 'var(--brand-red)';
        tabLogin.style.opacity = '1';
        
        tabRegister.classList.remove('active');
        tabRegister.style.borderBottomColor = 'transparent';
        tabRegister.style.opacity = '0.6';
        
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    });
    
    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabRegister.style.borderBottomColor = 'var(--brand-red)';
        tabRegister.style.opacity = '1';
        
        tabLogin.classList.remove('active');
        tabLogin.style.borderBottomColor = 'transparent';
        tabLogin.style.opacity = '0.6';
        
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    });
}

// Handle Login
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch('api/auth/login.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            const result = await res.json();
            
            if (result.status === 'success') {
                if (result.role === 'admin' || result.role === 'staff') {
                    window.location.href = 'admin.php';
                } else {
                    showToast('Welcome back!', 'success');
                    document.getElementById('auth-modal').classList.add('hidden');
                    checkAuth(); // update DOM without reload
                }
            } else {
                alert(result.message);
            }
        } catch(e) {
            alert('Login failed. Please try again.');
        }
    });
}

// Handle Register
if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            address: document.getElementById('reg-address').value,
            password: document.getElementById('reg-password').value
        };
        
        try {
            const res = await fetch('api/auth/register.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.status === 'success') {
                showToast('Account created successfully!', 'success');
                document.getElementById('auth-modal').classList.add('hidden');
                checkAuth(); // update DOM without reload
            } else {
                alert(result.message);
            }
        } catch(e) {
            alert('Registration failed. Please try again.');
        }
    });
}

// Top Nav "My Orders" Link
const navMyOrdersLink = document.getElementById('nav-my-orders-link');
if (navMyOrdersLink) {
    navMyOrdersLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            if (currentUser.role === 'admin' || currentUser.role === 'staff') {
                const choiceModal = document.getElementById('role-choice-modal');
                if (choiceModal) choiceModal.classList.remove('hidden');
            } else {
                document.getElementById('view-orders-btn').click();
            }
        } else {
            showToast('Please sign in to view your orders', 'error');
            document.getElementById('auth-modal').classList.remove('hidden');
        }
    });
}

// Role Choice Modal Logic
const roleChoiceModal = document.getElementById('role-choice-modal');
if (roleChoiceModal) {
    document.getElementById('close-choice-modal').addEventListener('click', () => {
        roleChoiceModal.classList.add('hidden');
    });
    
    document.getElementById('choice-dashboard-btn').addEventListener('click', () => {
        roleChoiceModal.classList.add('hidden');
        window.location.href = 'admin.php';
    });
    
    document.getElementById('choice-personal-btn').addEventListener('click', () => {
        roleChoiceModal.classList.add('hidden');
        document.getElementById('view-orders-btn').click();
    });
}

// Initial Check
checkAuth();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/cafe_delivery/sw.js').then(registration => {
      console.log('SW registered successfully');
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

window.userFavorites = window.userFavorites || [];

window.toggleFavorite = async (id, event) => {
    if (!currentUser) {
        showToast('Please sign in to save favorites', 'error');
        return;
    }
    
    const icon = event.currentTarget.querySelector('i');
    const isAdding = icon.classList.contains('ph-heart') && !icon.classList.contains('ph-fill');
    
    if (isAdding) {
        icon.className = 'ph-fill ph-heart';
        icon.style.color = 'var(--brand-red)';
        window.userFavorites.push(parseInt(id));
    } else {
        icon.className = 'ph ph-heart';
        icon.style.color = '#ffffff';
        window.userFavorites = window.userFavorites.filter(favId => favId !== parseInt(id));
        
        // If we are currently viewing the favorites tab, re-render
        const activeCat = document.querySelector('.category-btn.active');
        if (activeCat && activeCat.dataset.category === 'favorites') {
            setTimeout(() => {
                const filtered = menuData.filter(i => window.userFavorites.includes(parseInt(i.id)));
                renderMenu(filtered);
            }, 300);
        }
    }
    
    anime({
        targets: icon,
        scale: [1.5, 1],
        duration: 300,
        easing: 'easeOutBack'
    });

    try {
        await fetch('api/favorites.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ menu_id: id })
        });
    } catch(e) {
        console.error('Error toggling favorite');
    }
};

window.generatePDF = function(orderId, type) {
    const ordersArray = type === 'admin' ? window.allOrders : window.customerOrders;
    const order = ordersArray.find(o => parseInt(o.id) === parseInt(orderId));
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
        <div style="padding: 30px; font-family: 'Inter', sans-serif; color: #111; background: #fff; width: 400px; box-sizing: border-box;">
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

    const opt = {
        margin:       0,
        filename:     `Ace_Cafe_Receipt_Order_${order.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: [4.16, 6], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(htmlString).save();
};

// --- Promo Code & Loyalty Points Storefront Listeners ---
window.appliedCoupon = null;

const promoInput = document.getElementById('cart-promo-input');
const promoBtn = document.getElementById('cart-promo-btn');
const redeemCheckbox = document.getElementById('redeem-points-checkbox');

if (promoBtn) {
    promoBtn.addEventListener('click', async () => {
        const code = promoInput.value.trim();
        if (!code) {
            showToast('Please enter a coupon code.', 'error');
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (subtotal === 0) {
            showToast('Your cart is empty.', 'error');
            return;
        }
        
        try {
            const response = await fetch('api/apply_coupon.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, subtotal: subtotal })
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                window.appliedCoupon = result;
                showToast(result.message, 'success');
                renderCart();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            showToast('Server error applying coupon.', 'error');
        }
    });
}

if (redeemCheckbox) {
    redeemCheckbox.addEventListener('change', () => {
        renderCart();
    });
}


// --- SAVED ADDRESS BOOK & MAP PINNING (FEATURE 4) ---

let savedAddressesList = [];
let checkoutMapInstance = null;
let checkoutMapMarker = null;

// Tab switcher inside Profile modal
const tabInfo = document.getElementById('profile-tab-info');
const tabAddresses = document.getElementById('profile-tab-addresses');
const sectionInfo = document.getElementById('profile-info-section');
const sectionAddresses = document.getElementById('profile-addresses-section');

if (tabInfo && tabAddresses && sectionInfo && sectionAddresses) {
    tabInfo.addEventListener('click', () => {
        tabInfo.style.borderBottom = '2px solid var(--brand-red)';
        tabInfo.style.fontWeight = '700';
        tabInfo.style.color = 'var(--text-dark)';
        
        tabAddresses.style.borderBottom = 'none';
        tabAddresses.style.fontWeight = '600';
        tabAddresses.style.color = 'var(--text-muted)';
        
        sectionInfo.style.display = 'block';
        sectionAddresses.style.display = 'none';
    });
    
    tabAddresses.addEventListener('click', () => {
        tabAddresses.style.borderBottom = '2px solid var(--brand-red)';
        tabAddresses.style.fontWeight = '700';
        tabAddresses.style.color = 'var(--text-dark)';
        
        tabInfo.style.borderBottom = 'none';
        tabInfo.style.fontWeight = '600';
        tabInfo.style.color = 'var(--text-muted)';
        
        sectionInfo.style.display = 'none';
        sectionAddresses.style.display = 'block';
        fetchUserAddresses();
    });
}

const addAddrBtn = document.getElementById('profile-add-address-btn');
if (addAddrBtn) addAddrBtn.addEventListener('click', () => openAddressForm());

const cancelAddrBtn = document.getElementById('address-form-cancel');
if (cancelAddrBtn) cancelAddrBtn.addEventListener('click', closeAddressForm);

const saveAddrBtn = document.getElementById('address-form-save');
if (saveAddrBtn) saveAddrBtn.addEventListener('click', saveAddress);

async function fetchUserAddresses() {
    const listContainer = document.getElementById('profile-addresses-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div style="text-align: center; padding: 15px; color: var(--text-muted);">Loading addresses...</div>';
    
    try {
        const response = await fetch('api/addresses.php');
        const res = await response.json();
        
        if (res.status === 'success') {
            savedAddressesList = res.data;
            renderProfileAddresses();
        } else {
            listContainer.innerHTML = `<div style="text-align: center; padding: 15px; color: var(--brand-red);">\${res.message}</div>`;
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
        listContainer.innerHTML = '<div style="text-align: center; padding: 15px; color: var(--brand-red);">Failed to load addresses.</div>';
    }
}

function renderProfileAddresses() {
    const listContainer = document.getElementById('profile-addresses-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (savedAddressesList.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">No saved addresses yet. Add one below!</div>';
        return;
    }
    
    savedAddressesList.forEach(addr => {
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; position: relative;';
        
        const coordsDisplay = (addr.latitude && addr.longitude) 
            ? `<div style="font-size: 10px; color: var(--brand-red); display: flex; align-items: center; gap: 4px; font-weight: 600; margin-top: 2px;"><i class="ph ph-map-pin"></i> \${addr.latitude}, \${addr.longitude}</div>`
            : '';
            
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--text-dark); font-size: 14px;">\${addr.label}</strong>
                <div style="display: flex; gap: 10px;">
                    <button class="edit-addr-btn" style="background: none; border: none; cursor: pointer; color: var(--text-dark); font-size: 12px; font-weight: 600;">Edit</button>
                    <button class="delete-addr-btn" style="background: none; border: none; cursor: pointer; color: #ff4757; font-size: 12px; font-weight: 600;">Delete</button>
                </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; word-wrap: break-word;">\${addr.address_text}</div>
            \${coordsDisplay}
        `;
        
        div.querySelector('.edit-addr-btn').addEventListener('click', () => openAddressForm(addr));
        div.querySelector('.delete-addr-btn').addEventListener('click', () => deleteAddress(addr.id));
        
        listContainer.appendChild(div);
    });
}

function openAddressForm(addr = null) {
    const container = document.getElementById('profile-address-form-container');
    if (!container) return;
    
    container.style.display = 'block';
    
    if (addr) {
        document.getElementById('address-form-title').textContent = 'Edit Address';
        document.getElementById('address-form-id').value = addr.id;
        document.getElementById('address-form-label').value = addr.label;
        document.getElementById('address-form-text').value = addr.address_text;
        document.getElementById('address-form-lat').value = addr.latitude || '';
        document.getElementById('address-form-lng').value = addr.longitude || '';
    } else {
        document.getElementById('address-form-title').textContent = 'New Address';
        document.getElementById('address-form-id').value = '';
        document.getElementById('address-form-label').value = '';
        document.getElementById('address-form-text').value = '';
        document.getElementById('address-form-lat').value = '';
        document.getElementById('address-form-lng').value = '';
    }
    
    const section = document.getElementById('profile-addresses-section');
    if(section) {
        setTimeout(() => {
            section.scrollTop = section.scrollHeight;
        }, 50);
    }
}

function closeAddressForm() {
    const container = document.getElementById('profile-address-form-container');
    if (container) container.style.display = 'none';
}

async function saveAddress() {
    const id = document.getElementById('address-form-id').value;
    const label = document.getElementById('address-form-label').value.trim() || 'Home';
    const text = document.getElementById('address-form-text').value.trim();
    const lat = document.getElementById('address-form-lat').value.trim();
    const lng = document.getElementById('address-form-lng').value.trim();
    
    if (!text) {
        showToast('Address text is required.', 'error');
        return;
    }
    
    const payload = {
        label: label,
        address_text: text,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null
    };
    if (id) {
        payload.id = parseInt(id);
    }
    
    try {
        const response = await fetch('api/addresses.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.status === 'success') {
            showToast(id ? 'Address updated!' : 'Address saved!');
            closeAddressForm();
            fetchUserAddresses();
        } else {
            showToast(res.message, 'error');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showToast('Failed to save address.', 'error');
    }
}

async function deleteAddress(id) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
        const response = await fetch('api/addresses.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const res = await response.json();
        if (res.status === 'success') {
            showToast('Address deleted successfully.');
            fetchUserAddresses();
        } else {
            showToast(res.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showToast('Failed to delete address.', 'error');
    }
}

// Checkout Addresses list populator & Map Picker initialization
async function populateCheckoutAddresses() {
    const select = document.getElementById('checkout-address-select');
    const container = document.getElementById('checkout-saved-addresses-container');
    if (!select || !container) return;
    
    select.innerHTML = '<option value="">-- Select a saved address --</option>';
    container.style.display = 'none';
    
    if (!currentUser) return;
    
    try {
        const response = await fetch('api/addresses.php');
        const res = await response.json();
        
        if (res.status === 'success' && res.data.length > 0) {
            container.style.display = 'block';
            res.data.forEach(addr => {
                const opt = document.createElement('option');
                opt.value = addr.id;
                opt.textContent = `\${addr.label}: \${addr.address_text.substring(0, 30)}...`;
                opt.dataset.address = addr.address_text;
                opt.dataset.lat = addr.latitude || '';
                opt.dataset.lng = addr.longitude || '';
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Error fetching checkout addresses:', e);
    }
}

const checkoutSelect = document.getElementById('checkout-address-select');
if (checkoutSelect) {
    checkoutSelect.addEventListener('change', (e) => {
        const opt = checkoutSelect.options[checkoutSelect.selectedIndex];
        if (opt && opt.value !== '') {
            document.getElementById('checkout-address').value = opt.dataset.address;
            
            const lat = opt.dataset.lat;
            const lng = opt.dataset.lng;
            if (lat && lng) {
                const parsedLat = parseFloat(lat);
                const parsedLng = parseFloat(lng);
                document.getElementById('checkout-lat').value = parsedLat;
                document.getElementById('checkout-lng').value = parsedLng;
                
                if (checkoutMapInstance && checkoutMapMarker) {
                    checkoutMapInstance.setView([parsedLat, parsedLng], 14);
                    checkoutMapMarker.setLatLng([parsedLat, parsedLng]);
                }
            }
        }
    });
}

function initCheckoutMap(lat = -1.9441, lng = 30.0619) {
    const mapContainer = document.getElementById('checkout-map');
    if (!mapContainer) return;
    
    document.getElementById('checkout-lat').value = lat;
    document.getElementById('checkout-lng').value = lng;
    
    if (checkoutMapInstance) {
        checkoutMapInstance.remove();
    }
    
    checkoutMapInstance = L.map('checkout-map').setView([lat, lng], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(checkoutMapInstance);
    
    checkoutMapMarker = L.marker([lat, lng], { draggable: true }).addTo(checkoutMapInstance);
    
    checkoutMapMarker.on('dragend', function (e) {
        const position = checkoutMapMarker.getLatLng();
        document.getElementById('checkout-lat').value = position.lat.toFixed(6);
        document.getElementById('checkout-lng').value = position.lng.toFixed(6);
    });
    
    checkoutMapInstance.on('click', function(e) {
        checkoutMapMarker.setLatLng(e.latlng);
        document.getElementById('checkout-lat').value = e.latlng.lat.toFixed(6);
        document.getElementById('checkout-lng').value = e.latlng.lng.toFixed(6);
    });

    setTimeout(() => {
        if(checkoutMapInstance) {
            checkoutMapInstance.invalidateSize();
        }
    }, 300);
}
