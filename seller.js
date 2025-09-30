// --- グローバル変数と状態管理 ---

// 事業者情報を管理するオブジェクト（ダミーデータ）
// 実際のアプリケーションでは、サーバーから取得します。
let sellerInfo = {
    name: '事業者A',
    imageUrl: 'https://placehold.co/150x150/a7f3d0/166534?text=事業者A',
    description: '私たちは、愛情を込めて育てた新鮮な野菜をお届けします。土づくりからこだわり、安全で美味しい野菜作りを心がけています。',
    contact: 'info@example.com'
};

// 出品者の商品を管理する配列（ダミーデータ）
let sellerProducts = [
    { id: 101, name: '新鮮トマト 1kg', description: '太陽の光をたっぷり浴びた、甘くてジューシーなトマトです。', imageUrl: 'https://placehold.co/100x100/ef4444/ffffff?text=トマト', price: 800 },
    { id: 102, name: '朝採れきゅうり 5本', description: 'みずみずしくて食感の良い、新鮮なきゅうり。サラダや漬物に最適です。', imageUrl: 'https://placehold.co/100x100/22c55e/ffffff?text=きゅうり', price: 450 },
];

// 配信済みメルマガを管理する配列（ダミーデータ）
let newsletters = [
    { id: 1, subject: '【週末セール】夏野菜がお買い得！', body: '今週末は夏野菜の特別セールを実施します！...', sentDate: '2023-08-15', imageUrl: 'https://placehold.co/600x200/a7f3d0/166534?text=夏野菜セール' },
];

// --- DOM要素の取得 ---
const sellerInfoDisplayEl = document.getElementById('seller-info-display');
const productListEl = document.getElementById('seller-product-list');
const newsletterListEl = document.getElementById('newsletter-list');
const sellerInfoModalEl = document.getElementById('seller-info-modal');
const productModalEl = document.getElementById('product-modal');
const newsletterModalEl = document.getElementById('newsletter-modal');
const notificationEl = document.getElementById('notification');
const sellerInfoForm = document.getElementById('seller-info-form');
const productForm = document.getElementById('product-form');
const newsletterForm = document.getElementById('newsletter-form');

// --- レンダリング（描画）関数 ---

/** 事業者情報を再描画します */
function renderSellerInfo() {
    sellerInfoDisplayEl.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div class="flex-shrink-0">
                <img class="h-24 w-24 rounded-full object-cover" src="${sellerInfo.imageUrl || 'https://placehold.co/150x150/e2e8f0/cbd5e1?text=No+Image'}" alt="${sellerInfo.name}">
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900">${sellerInfo.name}</h3>
                <p class="text-sm text-gray-600 mt-1">${sellerInfo.description}</p>
                <p class="text-sm text-gray-500 mt-2"><strong>連絡先:</strong> ${sellerInfo.contact}</p>
            </div>
        </div>
    `;
}

/** 商品一覧を再描画します */
function renderProductList() {
    if (sellerProducts.length === 0) {
        productListEl.innerHTML = `<p class="text-gray-500 text-center">まだ商品が登録されていません。</p>`;
        return;
    }
    productListEl.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sellerProducts.map(p => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img class="h-10 w-10 rounded-full object-cover" src="${p.imageUrl}" alt="${p.name}">
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${p.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥${p.price.toLocaleString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button data-product-id="${p.id}" class="edit-product-button text-emerald-600 hover:text-emerald-900 mr-4">編集</button>
                                <button data-product-id="${p.id}" class="delete-product-button text-red-600 hover:text-red-900">削除</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/** メルマガ一覧を再描画します */
function renderNewsletterList() {
    if (newsletters.length === 0) {
        newsletterListEl.innerHTML = `<p class="text-gray-500 text-center">まだ配信されたメルマガはありません。</p>`;
        return;
    }
    newsletterListEl.innerHTML = `
        <div class="space-y-4">
            ${newsletters.map(n => `
                <div class="p-4 border rounded-md overflow-hidden">
                    ${n.imageUrl ? `<img src="${n.imageUrl}" alt="${n.subject}" class="w-full h-32 object-cover mb-4 rounded">` : ''}
                    <p class="font-semibold text-gray-800">${n.subject}</p>
                    <p class="text-sm text-gray-500 truncate mt-1">${n.body}</p>
                    <p class="text-xs text-gray-400 text-right mt-2">配信日: ${n.sentDate}</p>
                </div>
            `).join('')}
        </div>
    `;
}

/** UI全体を更新します */
function updateUI() {
    renderSellerInfo();
    renderProductList();
    renderNewsletterList();
    lucide.createIcons();
}

// --- モーダル管理 ---

/** 事業者情報モーダルを表示/非表示にします */
function toggleSellerInfoModal(show) {
    if (show) {
        document.getElementById('seller-name').value = sellerInfo.name;
        document.getElementById('seller-image-url').value = sellerInfo.imageUrl;
        document.getElementById('seller-description').value = sellerInfo.description;
        document.getElementById('seller-contact').value = sellerInfo.contact;
        sellerInfoModalEl.classList.remove('hidden');
    } else {
        sellerInfoModalEl.classList.add('hidden');
    }
}

/** 商品モーダルを表示/非表示にします */
function toggleProductModal(show, product = null) {
    productForm.reset();
    if (show) {
        if (product) {
            document.getElementById('modal-title').textContent = '商品を編集';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-image-url').value = product.imageUrl;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-regular-price').value = product.price;
        } else {
            document.getElementById('modal-title').textContent = '新規商品を追加';
        }
        productModalEl.classList.remove('hidden');
    } else {
        productModalEl.classList.add('hidden');
    }
}

/** メルマガモーダルを表示/非表示にします */
function toggleNewsletterModal(show) {
    if (show) {
        newsletterForm.reset();
        newsletterModalEl.classList.remove('hidden');
    } else {
        newsletterModalEl.classList.add('hidden');
    }
}

// --- イベントハンドラとロジック ---

/** 通知を表示します */
function showNotification(message) {
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    notificationEl.classList.add('animate-fade-in-out');
    setTimeout(() => {
        notificationEl.style.display = 'none';
        notificationEl.classList.remove('animate-fade-in-out');
    }, 3000);
}

/** 事業者情報フォームが送信されたときの処理 */
function handleSellerInfoFormSubmit(event) {
    event.preventDefault();
    sellerInfo = {
        name: document.getElementById('seller-name').value,
        imageUrl: document.getElementById('seller-image-url').value,
        description: document.getElementById('seller-description').value,
        contact: document.getElementById('seller-contact').value,
    };
    showNotification('事業者情報を更新しました。');
    toggleSellerInfoModal(false);
    updateUI();
}

/** 商品フォームが送信されたときの処理 */
function handleProductFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('product-id').value;
    const newProduct = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('product-name').value,
        imageUrl: document.getElementById('product-image-url').value,
        description: document.getElementById('product-description').value,
        price: parseInt(document.getElementById('product-regular-price').value),
    };

    if (id) {
        sellerProducts = sellerProducts.map(p => p.id === newProduct.id ? newProduct : p);
        showNotification('商品を更新しました。');
    } else {
        sellerProducts.push(newProduct);
        showNotification('商品を追加しました。');
    }
    
    toggleProductModal(false);
    updateUI();
}

/** メルマガフォームが送信されたときの処理 */
function handleNewsletterFormSubmit(event) {
    event.preventDefault();
    const newNewsletter = {
        id: Date.now(),
        subject: document.getElementById('newsletter-subject').value,
        body: document.getElementById('newsletter-body').value,
        imageUrl: document.getElementById('newsletter-image-url').value,
        sentDate: new Date().toISOString().split('T')[0],
    };
    newsletters.unshift(newNewsletter);
    showNotification('メルマガを配信しました。');
    toggleNewsletterModal(false);
    updateUI();
}

// --- イベントリスナーの設定 ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('edit-info-button').addEventListener('click', () => toggleSellerInfoModal(true));
    document.getElementById('add-product-button').addEventListener('click', () => toggleProductModal(true));
    document.getElementById('add-newsletter-button').addEventListener('click', () => toggleNewsletterModal(true));
    
    document.getElementById('seller-info-modal-close-button').addEventListener('click', () => toggleSellerInfoModal(false));
    document.getElementById('modal-close-button').addEventListener('click', () => toggleProductModal(false));
    document.getElementById('newsletter-modal-close-button').addEventListener('click', () => toggleNewsletterModal(false));

    sellerInfoForm.addEventListener('submit', handleSellerInfoFormSubmit);
    productForm.addEventListener('submit', handleProductFormSubmit);
    newsletterForm.addEventListener('submit', handleNewsletterFormSubmit);

    productListEl.addEventListener('click', (event) => {
        const target = event.target;
        const productId = parseInt(target.dataset.productId);

        if (target.matches('.edit-product-button')) {
            const productToEdit = sellerProducts.find(p => p.id === productId);
            if (productToEdit) {
                toggleProductModal(true, productToEdit);
            }
        }

        if (target.matches('.delete-product-button')) {
            if (confirm('この商品を本当に削除しますか？')) {
                sellerProducts = sellerProducts.filter(p => p.id !== productId);
                showNotification('商品を削除しました。');
                updateUI();
            }
        }
    });

    updateUI(); // 初期表示
});

