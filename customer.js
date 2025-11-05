// Firebase関連のモジュールと共通関数をインポート
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { showNotification } from './shared.js';


// --- グローバル変数と状態管理 ---
let user = null; // ログインしているユーザーの情報を格納
let cart = [];
let products = []; // Firestoreから読み込む商品リスト

// --- DOM要素の取得 ---
const headerEl = document.getElementById('header-container');
const mainEl = document.getElementById('main-container');
const loginModalEl = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const cartModalEl = document.getElementById('cart-modal');
const cartItemsContainerEl = document.getElementById('cart-items-container');
const cartTotalContainerEl = document.getElementById('cart-total-container');
const checkoutButton = document.getElementById('checkout-button');


// --- Firestoreからのデータ読み込み ---

/** Firestoreから商品データを読み込み、グローバル変数 products に格納します */
async function loadProductsFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = []; // 配列をリセット
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id, // FirestoreのドキュメントIDをidとして使用
                ...doc.data()
            });
        });
    } catch (error) {
        console.error("Firestoreからの商品読み込みに失敗しました:", error);
        showNotification("商品の読み込みに失敗しました。");
    }
}


// --- レンダリング（描画）関数 ---

/** ヘッダーを描画します */
function renderHeader() {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    headerEl.innerHTML = `
        <header class="bg-emerald-800 text-white sticky top-0 z-50 shadow-md">
            <div class="container mx-auto px-4 flex items-center justify-between h-16">
                <div class="flex-shrink-0">
                    <a href="index.html" class="text-2xl font-bold text-white">農家のB品市場</a>
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
                                <span class="hidden md:inline">${user.firstName || 'ゲスト'} 様</span>
                                <button class="logout-button flex items-center hover:bg-emerald-700 p-2 rounded">
                                     <i data-lucide="log-out" class="w-5 h-5 mr-1"></i>
                                    <span class="hidden md:inline">ログアウト</span>
                                </button>
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


/** メインコンテンツを描画します */
function renderMainContent() {
    let productGridHTML = '';

    if (products.length === 0) {
        productGridHTML = `<p class="text-gray-500 text-center col-span-full">現在販売中の商品はありません。</p>`;
    } else {
        productGridHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div class="p-4 bg-gray-50 flex justify-center items-center">
                    <img src="${product.imageUrl || 'https://placehold.co/300x300/e2e8f0/cbd5e1?text=No+Image'}" alt="${product.name}" class="h-40 object-cover" />
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-base text-slate-800 font-semibold mb-2 flex-grow hover:text-emerald-600 cursor-pointer">${product.name}</h3>
                    <p class="text-sm text-gray-600 mt-1 mb-2">${product.description || ''}</p>
                    
                    ${product.isReservation ? `
                        <div class="my-2 p-2 bg-sky-50 border border-sky-200 rounded-md">
                            <span class="text-xs font-bold bg-sky-500 text-white px-2 py-1 rounded-full">予約販売</span>
                            <p class="text-sm text-sky-800 font-semibold mt-1">${product.reservationNote || ''}</p>
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
        `).join('');
    }

    const fullProductGridHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">商品ラインナップ</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${productGridHTML}
        </div>
    `;

    // ★ 変更点: ログイン状態 (if !user) に関わらず、常に商品グリッドのみを表示
    mainEl.innerHTML = fullProductGridHTML;
}

/** カートモーダルの中身を描画します */
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainerEl.innerHTML = `<p class="text-gray-500 text-center py-8">カートは空です。</p>`;
        cartTotalContainerEl.innerHTML = '';
        checkoutButton.disabled = true;
    } else {
        cartItemsContainerEl.innerHTML = cart.map(item => `
            <div class="flex items-center space-x-4 border-b py-4">
                <img src="${item.imageUrl || 'https://placehold.co/100x100/e2e8f0/cbd5e1?text=No+Image'}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md">
                <div class="flex-grow">
                    <p class="font-semibold text-slate-800">${item.name}</p>
                    <p class="text-sm text-gray-600">¥${item.price.toLocaleString()}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button data-product-id="${item.id}" data-change="-1" class="update-quantity-button bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-300">-</button>
                    <span>${item.quantity}</span>
                    <button data-product-id="${item.id}" data-change="1" class="update-quantity-button bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-300">+</button>
                </div>
                <div class="text-right w-24">
                    <p class="font-bold text-slate-800">¥${(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button data-product-id="${item.id}" class="remove-from-cart-button text-gray-400 hover:text-red-500">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `).join('');

        const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        cartTotalContainerEl.innerHTML = `
            <p class="text-lg">小計: <span class="font-bold text-2xl text-slate-800">¥${totalPrice.toLocaleString()}</span> (税込)</p>
        `;
        checkoutButton.disabled = false;
    }
    // カートモーダル内の描画では、ヘッダーのみ更新する
    renderHeader();
    lucide.createIcons();
}

/** UI全体を更新します (非同期に変更) */
async function updateUI() {
    // 最初にFirestoreから最新の商品データを読み込む
    await loadProductsFromFirestore();
    
    renderHeader();
    renderMainContent();
    lucide.createIcons(); // アイコンを再描画
}

// --- モーダル制御 ---
function showLoginModal() {
    loginModalEl.classList.remove('hidden');
}
function hideLoginModal() {
    loginModalEl.classList.add('hidden');
}
function showCartModal() {
    renderCart();
    cartModalEl.classList.remove('hidden');
}
function hideCartModal() {
    cartModalEl.classList.add('hidden');
}


// --- Firebase 認証 ---

/** ログインフォームが送信されたときの処理 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        hideLoginModal();
        showNotification('ログインしました。');
    } catch (error) {
        console.error("ログインエラー:", error.code);
        showNotification('メールアドレスまたはパスワードが正しくありません。');
    }
}

/** ログアウト処理 */
async function handleLogout() {
    try {
        await signOut(auth);
        showNotification('ログアウトしました。');
    } catch (error) {
        console.error("ログアウトエラー:", error);
        showNotification('ログアウトに失敗しました。');
    }
}

// --- カート操作 ---

/** ユーザーのカート情報をFirestoreに保存します */
async function saveCartToFirestore() {
    if (!user) return; // ログインしていない場合は何もしない
    try {
        const userDocRef = doc(db, "users", user.uid);
        // { merge: true } を使うことで、他のユーザー情報を上書きせず cart フィールドのみを更新
        await setDoc(userDocRef, { cart: cart }, { merge: true });
    } catch (error) {
        console.error("カートの保存に失敗しました:", error);
        showNotification('カートの更新に失敗しました。');
    }
}

/** カートに商品を追加します */
function handleAddToCart(productId) {
    // Firestoreから読み込んだグローバル変数 products を参照する
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error(`商品ID: ${productId} が見つかりません。`);
        showNotification('商品の追加に失敗しました。');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    showNotification(`${product.name}をカートに追加しました。`);
    
    // ヘッダーのカートアイコンだけを素早く更新
    renderHeader();
    lucide.createIcons();
    
    saveCartToFirestore();
}

/** カートから商品を削除します */
function handleRemoveFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    showNotification('商品をカートから削除しました。');
    renderCart();
    saveCartToFirestore();
}

/** カート商品の数量を変更します */
function handleUpdateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            handleRemoveFromCart(productId);
        } else {
            renderCart();
            saveCartToFirestore();
        }
    }
}

/**
 * 2つのカート配列をマージ（統合）します。
 * @param {Array} guestCart - ゲスト時のカート
 * @param {Array} userCart - Firestoreから読み込んだユーザーのカート
 * @returns {Array} マージされた新しいカート配列
 */
function mergeCarts(guestCart, userCart) {
    const mergedCart = [...userCart];

    guestCart.forEach(guestItem => {
        const existingItem = mergedCart.find(userItem => userItem.id === guestItem.id);
        if (existingItem) {
            // 同じ商品があれば数量を合計
            existingItem.quantity += guestItem.quantity;
        } else {
            // なければ商品を追加
            mergedCart.push(guestItem);
        }
    });

    return mergedCart;
}


// --- イベントリスナーの設定 ---
document.addEventListener('DOMContentLoaded', async () => { // async に変更

    // 認証状態の監視の前に、まず商品リストを読み込む
    // これにより、ゲストユーザーでも商品が見えるようになる
    await updateUI();

    // Firebaseの認証状態の変化を監視
    onAuthStateChanged(auth, async (firebaseUser) => {
        const guestCart = [...cart]; // ログイン処理の直前のカート内容（ゲストカート）を保持

        if (firebaseUser) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            let firestoreCart = [];

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                user = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    firstName: userData['first-name'],
                    lastName: userData['last-name'],
                    // 決済時に使うため、ユーザー情報をローカルストレージにも保存
                    email: firebaseUser.email,
                    address: {
                        postalCode: userData['postal-code'] || '',
                        prefecture: userData['prefecture'] || '',
                        city: userData['city'] || '',
                        street: userData['street'] || '',
                        apartment: userData['apartment'] || '',
                    }
                };
                firestoreCart = userData.cart || [];
            } else {
                user = { 
                    uid: firebaseUser.uid, 
                    email: firebaseUser.email,
                    address: null // 住所情報がない
                };
            }

            // ゲスト時のカートに商品が入っていれば、Firestoreのカートと統合
            if (guestCart.length > 0) {
                cart = mergeCarts(guestCart, firestoreCart);
                await saveCartToFirestore(); // 統合したカートをすぐに保存
                showNotification('カートを統合しました。');
            } else {
                // ゲストカートが空なら、Firestoreのカートをそのまま使う
                cart = firestoreCart;
            }

        } else {
            // ユーザーがログアウトしている場合
            user = null;
            // ログアウト時にゲストカートに戻す（ゲストカートは保持しない仕様の場合は cart = []）
            // ここでは、ログアウトしたらカートは空にする
            cart = []; 
        }
        
        // 認証状態が変わったら、商品リストは再読み込みせず、
        // ヘッダーとメインコンテンツ（ログイン表示有無）のみ更新
        renderHeader();
        renderMainContent(); // ★ 変更点: ログイン/ログアウト時にもメインコンテンツを再描画（内容は変わらないが念のため）
        lucide.createIcons();
    });

    // ログインフォームの送信イベント
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // イベント委任を使用して、動的に生成される要素のクリックを処理
    document.body.addEventListener('click', (event) => {
        // クリックされた要素がボタン、またはボタン内の要素（iタグなど）であることを確認
        const button = event.target.closest('button');
        if (!button) return;
        
        // --- ログイン・ログアウト関連 ---
        if (button.matches('.login-button')) showLoginModal();
        if (button.matches('.logout-button')) handleLogout();
        if (button.matches('#login-modal-close-button')) hideLoginModal();

        // --- カート関連 ---
        if (button.matches('.add-to-cart-button')) {
            handleAddToCart(button.dataset.productId);
        }
        if (button.matches('.cart-button')) {
            showCartModal();
        }
        if (button.matches('#cart-modal-close-button')) {
            hideCartModal();
        }
        if (button.matches('.remove-from-cart-button')) {
            const itemButton = event.target.closest('[data-product-id]');
            if (itemButton) {
                handleRemoveFromCart(itemButton.dataset.productId);
            }
        }
        if (button.matches('.update-quantity-button')) {
            const change = parseInt(button.dataset.change, 10);
            handleUpdateQuantity(button.dataset.productId, change);
        }
        
        // --- 決済ページへの遷移 ---
        if (button.matches('#checkout-button')) {
            if (cart.length === 0) {
                showNotification('カートは空です。');
                return;
            }
            
            // 決済ページで使う情報をローカルストレージに保存
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // ログインユーザーのメールアドレスと都道府県を渡す
            if(user && user.email) {
                localStorage.setItem('userEmail', user.email);
                // user.address が存在し、prefecture が設定されているか確認
                if (user.address && user.address.prefecture) {
                    localStorage.setItem('userPrefecture', user.address.prefecture);
                } else {
                    localStorage.removeItem('userPrefecture'); // 登録情報がなければ削除
                }
            } else {
                // ゲストユーザーの場合は空にする
                localStorage.setItem('userEmail', ''); 
                localStorage.removeItem('userPrefecture'); // ゲストは都道府県を削除
            }
            
            // 決済ページに遷移
            window.location.href = 'checkout.html';
        }
    });
    
});