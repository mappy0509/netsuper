// --- グローバル変数と状態管理 ---
let user = null; // nullは非ログイン状態
let cart = [];
const products = [
    { id: 1, name: '国産オーガニック人参 500g', imageUrl: 'https://placehold.co/300x300/f6ad55/ffffff?text=人参', regularPrice: 350, memberPrice: 300, category: '野菜', rating: 4.5, reviews: 120 },
    { id: 2, name: '朝採れ新鮮たまご 10個パック', imageUrl: 'https://placehold.co/300x300/f9e2af/ffffff?text=たまご', regularPrice: 280, memberPrice: 250, category: '卵・乳製品', rating: 5, reviews: 350 },
    { id: 3, name: '特選牛乳 1L', imageUrl: 'https://placehold.co/300x300/e2e8f0/ffffff?text=牛乳', regularPrice: 250, memberPrice: 220, category: '卵・乳製品', rating: 4, reviews: 88 },
    { id: 4, name: '天然酵母食パン 1斤', imageUrl: 'https://placehold.co/300x300/d69e2e/ffffff?text=パン', regularPrice: 420, memberPrice: 380, category: 'パン', rating: 4.5, reviews: 213 },
    { id: 5, name: 'ブランド豚バラ肉 200g', imageUrl: 'https://placehold.co/300x300/f56565/ffffff?text=豚肉', regularPrice: 580, memberPrice: 520, category: '肉', rating: 5, reviews: 98 },
    { id: 6, name: '北海道産じゃがいも 1kg', imageUrl: 'https://placehold.co/300x300/b7791f/ffffff?text=じゃがいも', regularPrice: 400, memberPrice: 360, category: '野菜', rating: 4, reviews: 154 },
];

// --- DOM要素の取得 ---
const headerEl = document.getElementById('header-container');
const demoControlsEl = document.getElementById('demo-controls');
const mainEl = document.getElementById('main-container');
const notificationEl = document.getElementById('notification');

// --- レンダリング（描画）関数 ---

/** ヘッダーを描画します */
function renderHeader() {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    headerEl.innerHTML = `
        <header class="bg-emerald-800 text-white sticky top-0 z-50 shadow-md">
            <div class="container mx-auto px-4 flex items-center justify-between h-16">
                <div class="flex-shrink-0">
                    <a href="customer.html" class="text-2xl font-bold text-white">NetSuper</a>
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
                                ${user.isMember ? '<i data-lucide="crown" class="text-amber-400"></i>' : ''}
                            </div>`
                        : ` <div class="flex items-center space-x-2">
                                <a href="membership.html" class="flex items-center hover:bg-emerald-700 p-2 rounded">
                                    <i data-lucide="user-plus" class="w-5 h-5 mr-1"></i>
                                    <span class="hidden md:inline">会員登録</span>
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
            <div class="bg-emerald-700 text-white">
                <div class="container mx-auto px-4 flex items-center space-x-4 h-10 text-sm font-semibold">
                    <button class="flex items-center"><i data-lucide="menu" class="w-5 h-5 mr-1"></i>すべて</button>
                    <a href="#" class="hover:underline">野菜</a>
                    <a href="#" class="hover:underline">肉</a>
                    <a href="#" class="hover:underline">卵・乳製品</a>
                    <a href="#" class="hover:underline">パン</a>
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
            <button class="demo-login-general bg-sky-500 hover:bg-sky-600 px-2 py-1 rounded-md text-xs mx-1">一般ユーザー</button>
            <button class="demo-login-member bg-emerald-500 hover:bg-emerald-600 px-2 py-1 rounded-md text-xs mx-1">有料会員</button>
            <button class="demo-logout bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded-md text-xs mx-1">ログアウト</button>
        </div>
    `;
}

/** メインコンテンツを描画します */
function renderMainContent() {
    const isMember = user?.isMember || false;
    const productGridHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">おすすめ商品</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${products.map(product => {
                const priceToShow = isMember ? product.memberPrice : product.regularPrice;
                const priceDifference = product.regularPrice - product.memberPrice;
                return `
                <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div class="p-4 bg-gray-50 flex justify-center items-center">
                        <img src="${product.imageUrl}" alt="${product.name}" class="h-40 object-cover" />
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-base text-slate-800 font-semibold mb-2 flex-grow hover:text-emerald-600 cursor-pointer">${product.name}</h3>
                        <div class="flex items-center mb-2">
                            <div class="flex text-amber-500">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</div>
                            <span class="text-sm text-emerald-600 ml-2 hover:underline cursor-pointer">${product.reviews}</span>
                        </div>
                        <div class="mb-4">
                            <span class="text-2xl font-bold text-slate-800">¥${priceToShow.toLocaleString()}</span>
                            ${!isMember ? `<span class="text-sm text-gray-500 line-through ml-2">¥${product.regularPrice.toLocaleString()}</span>` : ''}
                        </div>
                        ${isMember ? `<div class="mb-2"><span class="text-xs font-bold bg-emerald-600 text-white px-2 py-1 rounded-sm flex items-center w-max"><i data-lucide="crown" class="w-3 h-3 mr-1"></i>会員価格</span></div>` : ''}
                        ${!isMember && priceDifference > 0 ? `<div class="mb-2 text-sm text-emerald-700 font-semibold">会員登録で ¥${priceDifference} 節約</div>` : ''}
                        <button data-product-id="${product.id}" class="add-to-cart-button mt-auto w-full bg-amber-500 border border-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg shadow-sm transition-colors">カートに入れる</button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;

    if (!user) {
        mainEl.innerHTML = `
            <div class="bg-white p-6 rounded-lg mb-8 shadow-sm text-center border">
                <h2 class="text-2xl font-bold mb-2">サインインしてお買い物</h2>
                <button class="login-button bg-amber-500 border border-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-10 rounded-lg shadow-sm transition-colors">
                    ログイン
                </button>
                <p class="text-sm mt-2">
                    初めてご利用ですか? <a href="membership.html" class="text-emerald-600 hover:underline font-semibold">会員登録はこちら</a>
                </p>
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

/** ログインをシミュレートします */
function simulateLogin(isMember = false) {
    user = { name: 'テストユーザー', isMember };
    showNotification(isMember ? '会員としてログインしました。' : 'ようこそ！ログインしました。');
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
        if (target.matches('.demo-login-general')) simulateLogin(false);
        if (target.matches('.demo-login-member')) simulateLogin(true);
        if (target.matches('.demo-logout')) simulateLogout();
        
        // ログイン
        if (target.matches('.login-button')) simulateLogin(false);
        
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

