/* ==========================================================================
   શ્રી શિવ શક્તિ જ્વેલર્સ - CMS & Admin Panel JavaScript
   વર્ઝન: 1.0 (Local Storage & CMS Bridge)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productForm = document.getElementById('product-cms-form');
    const productTbody = document.getElementById('cms-product-tbody');
    const totalProductsEl = document.getElementById('stat-total-products');
    const silverCountEl = document.getElementById('stat-silver-count');
    const brassCountEl = document.getElementById('stat-brass-count');
    const inStockCountEl = document.getElementById('stat-instock-count');
    const listCountLabel = document.getElementById('list-count-label');
    const searchInput = document.getElementById('search-product-input');
    const filterCategory = document.getElementById('filter-category-select');
    const imagePreviewList = document.getElementById('image-preview-list');
    const imageUrlInput = document.getElementById('product-image-url');
    const imageFileInput = document.getElementById('product-images-file');
    const dropZone = document.getElementById('drop-zone');
    const cmsStatusDot = document.getElementById('cms-status-dot');
    const cmsStatusText = document.getElementById('cms-status-text');
    const syncBtn = document.getElementById('sync-cms-btn');
    const openCmsModalBtn = document.getElementById('open-cms-settings');
    const closeCmsModalBtn = document.getElementById('close-cms-modal');
    const cmsSettingsModal = document.getElementById('cms-settings-modal');
    const saveCmsConfigBtn = document.getElementById('save-cms-config-btn');

    // Local Storage Key
    const STORAGE_KEY = 'shree_shiv_shakti_products';

    // Initial Products Data (જો પહેલેથી ડેટા ન હોય તો સેમ્પલ ડેટા નાખવો)
    let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        {
            id: 'prod_1',
            name: 'ભરવાડના હેવી કડા',
            category: 'કડા',
            metal: 'જર્મન સિલ્વર',
            price: 3500,
            weight: '૨૫૦ ગ્રામ',
            description: 'પરંપરાગત ડિઝાઇન વાળા મજબૂત અને આકર્ષક કડા.',
            imageUrl: 'https://images.unsplash.com/photo-1611591483245-28e3be1c2bb7?auto=format&fit=crop&w=500&q=80',
            inStock: true
        },
        {
            id: 'prod_2',
            name: 'પંચમુખી હનુમાન મૂર્તિ',
            category: 'મૂર્તિ',
            metal: 'બ્રાસ',
            price: 2500,
            weight: '૫૦૦ ગ્રામ',
            description: 'દુઃખ હરણ અને રક્ષણ માટેની આકર્ષક પંચમુખી બ્રાસ મૂર્તિ.',
            imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fae?auto=format&fit=crop&w=500&q=80',
            inStock: true
        }
    ];

    // Initialize CMS Status
    updateCmsStatus('connected', 'CMS સક્રિય (Local Storage)');

    // Render Products on Load
    renderProducts(products);
    updateStats(products);

    // Image Upload / Preview Handling
    if (dropZone && imageFileInput) {
        dropZone.addEventListener('click', () => imageFileInput.click());

        imageFileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                imagePreviewList.innerHTML = '';
                const reader = new FileReader();
                reader.onload = function(event) {
                    imageUrlInput.value = event.target.result; // Base64 URL
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-thumb';
                    imagePreviewList.appendChild(img);
                    showToast('ફોટો સફળતાપૂર્વક અપલોડ થયો!');
                }
                reader.readAsDataURL(files[0]);
            }
        });
    }

    // Form Submit Event (Add or Update Product)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productId = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const metal = document.getElementById('product-metal').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const weight = document.getElementById('product-weight').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const imageUrl = imageUrlInput.value.trim() || 'https://via.placeholder.com/300';
        const inStock = document.getElementById('product-stock').value === 'true';

        if (!name || !category || !price || !description) {
            showToast('કૃપા કરીને તમામ જરૂરી માહિતી ભરો!', 'error');
            return;
        }

        if (productId) {
            // Update Existing Product
            products = products.map(p => p.id === productId ? {
                ...p, name, category, metal, price, weight, description, imageUrl, inStock
            } : p);
            showToast('પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થઈ ગઈ!');
            document.getElementById('form-title').innerHTML = '➕ નવી પ્રોડક્ટ ઉમેરો';
            document.getElementById('edit-mode-badge').innerText = 'નવી એન્ટ્રી';
        } else {
            // Add New Product
            const newProduct = {
                id: 'prod_' + Date.now(),
                name,
                category,
                metal,
                price,
                weight,
                description,
                imageUrl,
                inStock
            };
            products.unshift(newProduct);
            showToast('નવી પ્રોડક્ટ સફળતાપૂર્વક ઉમેરાઈ ગઈ!');
        }

        saveAndRefresh();
        productForm.reset();
        imagePreviewList.innerHTML = '';
    });

    // Save to LocalStorage and Refresh UI
    function saveAndRefresh() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        renderProducts(products);
        updateStats(products);
    }

    // Render Products Table
    function renderProducts(items) {
        productTbody.innerHTML = '';
        
        if (items.length === 0) {
            productTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">કોઈ પ્રોડક્ટ ઉપલબ્ધ નથી.</td></tr>`;
            listCountLabel.innerText = 'કુલ: 0';
            return;
        }

        listCountLabel.innerText = `કુલ: ${items.length}`;

        items.forEach((p) => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-silver';
            if (p.metal === 'બ્રાસ') badgeClass = 'badge-brass';
            if (p.metal === 'ગોલ્ડ પ્લેટેડ') badgeClass = 'badge-gold';

            tr.innerHTML = `
                <td><img src="${p.imageUrl}" alt="${p.name}" class="td-img"></td>
                <td>
                    <strong>${p.name}</strong><br>
                    <small style="color:var(--text-muted);">${p.weight || 'વજન ઉપલબ્ધ નથી'}</small>
                </td>
                <td>
                    <span class="badge ${badgeClass}">${p.metal}</span><br>
                    <small>${p.category}</small>
                </td>
                <td><strong>₹ ${p.price.toLocaleString('en-IN')}</strong></td>
                <td>
                    <div class="action-btns">
                        <button type="button" class="btn btn-outline btn-sm edit-btn" data-id="${p.id}" title="સુધારો">✏️</button>
                        <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${p.id}" title="કાઢી નાખો">🗑️</button>
                    </div>
                </td>
            `;
            productTbody.appendChild(tr);
        });

        // Attach Edit & Delete Listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editProduct(e.target.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
        });
    }

    // Edit Product Function
    function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-metal').value = product.metal;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-weight').value = product.weight || '';
        document.getElementById('product-description').value = product.description;
        imageUrlInput.value = product.imageUrl;
        document.getElementById('product-stock').value = product.inStock ? 'true' : 'false';

        document.getElementById('form-title').innerHTML = '✏️ પ્રોડક્ટ સુધારો';
        document.getElementById('edit-mode-badge').innerText = 'એડિટ મોડ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Delete Product Function
    function deleteProduct(id) {
        if (confirm('શું તમે ખરેખર આ પ્રોડક્ટ ડિલીટ કરવા માંગો છો?')) {
            products = products.filter(p => p.id !== id);
            saveAndRefresh();
            showToast('પ્રોડક્ટ ડિલીટ થઈ ગઈ.', 'error');
        }
    }

    // Update Dashboard Statistics
    function updateStats(items) {
        totalProductsEl.innerText = items.length;
        silverCountEl.innerText = items.filter(p => p.metal.includes('સિલ્વર')).length;
        brassCountEl.innerText = items.filter(p => p.metal === 'બ્રાસ' || p.category === 'મૂર્તિ').length;
        inStockCountEl.innerText = items.filter(p => p.inStock).length;
    }

    // Search & Filter Events
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        renderProducts(filtered);
    });

    filterCategory.addEventListener('change', (e) => {
        const cat = e.target.value;
        if (cat === 'ALL') {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.category === cat);
            renderProducts(filtered);
        }
    });

    // CMS Status Helper
    function updateCmsStatus(status, text) {
        if (status === 'connected') {
            cmsStatusDot.classList.add('connected');
        } else {
            cmsStatusDot.classList.remove('connected');
        }
        cmsStatusText.innerText = text;
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeftColor = type === 'error' ? 'var(--danger-red)' : 'var(--gold-primary)';
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Modal Events
    openCmsModalBtn.addEventListener('click', () => cmsSettingsModal.classList.add('active'));
    closeCmsModalBtn.addEventListener('click', () => cmsSettingsModal.classList.remove('active'));
    
    syncBtn.addEventListener('click', () => {
        saveAndRefresh();
        showToast('ડેટા સફળતાપૂર્વક સિંક થઈ ગયો છે!');
    });

});
          
