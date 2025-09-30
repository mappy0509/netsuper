// --- グローバル変数と状態管理 ---
let user = null; // nullは非ログイン状態
let cart = [];

// --- DOM要素の取得 ---
const headerEl = document.getElementById('header-container');
const demoControlsEl = document.getElementById('demo-controls');
const mainEl = document.getElementById('main-container');

// --- レンダリング（描画）関数 ---

/** ヘッダーを描画します */
function renderHeader() {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    headerEl.innerHTML = `
        <header class="bg-emerald-800 text-white sticky top-0 z-50 shadow-md">
            <div class="container mx-auto px-4 flex items-center justify-between h-16">
                <div class="flex-shrink-0">
                    <a href="index.html" class="text-2xl font-bold text-white">NetSuper</a>
                </div>
                <div class="hidden sm:flex flex-grow mx-4">
                    <input type="text" placeholder="商品を探す" class="w-full px-4 py-2 rounded-l-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <button class="bg-amber-500 hover:bg-amber-600 px-4 rounded-r-md">
                        <i data-lucide="search" class="text-white"></i>
                    </button>
                </div>
                <div class="flex items-center space-x-2">
                    ${user
                        ? ` <div class="flex items-center space-x-2">
                                <i data-lucide="user"></i>
                                <span class="hidden md:inline">${user.name} 様</span>
                            </div>`
                        : ` <div class="flex items-center space-x-2">
                                <a href="signup.html" class="flex items-center hover:bg-emerald-700 p-2 rounded">
                                    <i data-lucide="user-plus" class="w-5 h-5 mr-1"></i>
                                    <span class="hidden md:inline">新規登録</span>
                                </a>
                                <button class="login-button flex items-center hover:bg-emerald-700 p-2 rounded">
                                    <i data-lucide="log-in" class="w-5 h-5 mr-1"></i>
                                    <span class="hidden md:inline">ログイン</span>
                                </button>
                            </div>`
                    }
                    <button class="cart-button relative flex items-center hover:bg-emerald-700 p-2 rounded">
                        <i data-lucide="shopping-cart" class="w-7 h-7"></i>
                        <span class="hidden md:inline ml-1">カート</span>
                        ${cartItemCount > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${cartItemCount}</span>` : ''}
                    </button>
                </div>
            </div>
        </header>
    `;
}

/** デモ操作ボタンを描画します */
function renderDemoControls() {
    demoControlsEl.innerHTML = `
        <div class="bg-slate-700 p-2 text-center text-sm text-white">
            <span class="font-bold mb-1 mr-4">【デモ操作】</span>
            <button class="demo-login bg-sky-500 hover:bg-sky-600 px-2 py-1 rounded-md text-xs mx-1">ログイン</button>
            <button class="demo-logout bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded-md text-xs mx-1">ログアウト</button>
        </div>
    `;
}

/** メインコンテンツを描画します */
function renderMainContent() {
    const productGridHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">商品ラインナップ</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${products.map(product => `
                <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div class="p-4 bg-gray-50 flex justify-center items-center">
                        <img src="${product.imageUrl}" alt="${product.name}" class="h-40 object-cover" />
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-base text-slate-800 font-semibold mb-2 flex-grow hover:text-emerald-600 cursor-pointer">${product.name}</h3>
                        <p class="text-sm text-gray-600 mt-1 mb-2">${product.description}</p>
                        
                        ${product.isReservation ? `
                            <div class="my-2 p-2 bg-sky-50 border border-sky-200 rounded-md">
                                <span class="text-xs font-bold bg-sky-500 text-white px-2 py-1 rounded-full">予約販売</span>
                                <p class="text-sm text-sky-800 font-semibold mt-1">${product.reservationNote}</p>
                            </div>` : ''}
                        
                        ${product.shippingInfo ? `
                            <div class="mt-2 text-xs text-gray-500">
                                <p><strong>送料(税込):</strong> ${product.shippingInfo}</p>
                            </div>` : ''}

                        <div class="mt-4 mb-4">
                            <span class="text-2xl font-bold text-slate-800">¥${product.price.toLocaleString()}</span>
                            <span class="text-sm text-gray-500"> (税込)</span>
                        </div>

                        <button data-product-id="${product.id}" class="add-to-cart-button mt-auto w-full bg-amber-500 border border-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg shadow-sm transition-colors">カートに入れる</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (!user) {
        mainEl.innerHTML = `
            <div class="bg-white p-6 rounded-lg mb-8 shadow-sm text-center border">
                <h2 class="text-2xl font-bold mb-2">ログイン・新規登録</h2>
                <p class="text-gray-600 mb-4">アカウントをお持ちでない方もご購入いただけます。</p>
                <div class="flex justify-center items-center space-x-4">
                    <button class="login-button bg-amber-500 border border-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-10 rounded-lg shadow-sm transition-colors">
                        ログイン
                    </button>
                    <a href="signup.html" class="text-emerald-600 hover:underline font-semibold">新規登録はこちら</a>
                </div>
            </div>
            ${productGridHTML}
        `;
    } else {
        mainEl.innerHTML = productGridHTML;
    }
}

/** UI全体を更新します */
function updateUI() {
    renderHeader();
    renderDemoControls();
    renderMainContent();
    lucide.createIcons(); // アイコンを再描画
}

// --- イベントハンドラとロジック ---

/** ログインをシミュレートします */
function simulateLogin() {
    user = { name: 'テストユーザー' };
    showNotification('ようこそ！ログインしました。');
    updateUI();
};

/** ログアウトをシミュレートします */
function simulateLogout() {
    user = null;
    cart = []; // ログアウト時にカートを空にする
    showNotification('ログアウトしました。');
    updateUI();
}

/** カートに商品を追加します */
function handleAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    showNotification(`${product.name}をカートに追加しました。`);
    updateUI();
}

// --- イベントリスナーの設定 ---
document.addEventListener('DOMContentLoaded', () => {
    // イベント委任を使用して、動的に生成される要素のクリックを処理
    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        // デモ操作
        if (target.matches('.demo-login')) simulateLogin();
        if (target.matches('.demo-logout')) simulateLogout();
        
        // ログイン
        if (target.matches('.login-button')) simulateLogin();
        
        // カートに追加
        if (target.matches('.add-to-cart-button')) {
            const productId = parseInt(target.dataset.productId);
            handleAddToCart(productId);
        }

        // カートボタン（今回はダミー）
        if (target.matches('.cart-button')) {
            showNotification('カートページは現在準備中です。');
        }
    });

    // 初期表示
    updateUI();
});

