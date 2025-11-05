// Firebase関連のモジュールと共通関数をインポート
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
    collection, getDocs, getDoc, addDoc, setDoc, deleteDoc, doc, 
    Timestamp, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { showNotification } from './shared.js';


// --- グローバル変数と状態管理 ---
let sellerInfo = {};
let sellerProducts = [];
let newsletters = [];
let currentSellerId = null; // ログインしたユーザーのUID（動的に設定）
let currentUserEmail = null; // ログインしたユーザーのEmail（表示用）

// --- DOM要素の取得 ---
const sellerAppContainer = document.getElementById('seller-app-container');
const adminUserInfoEl = document.getElementById('admin-user-info');
const sellerInfoDisplayEl = document.getElementById('seller-info-display');
const productListEl = document.getElementById('seller-product-list');
const newsletterListEl = document.getElementById('newsletter-list');
const sellerInfoModalEl = document.getElementById('seller-info-modal');
const productModalEl = document.getElementById('product-modal');
const newsletterModalEl = document.getElementById('newsletter-modal');
const sellerInfoForm = document.getElementById('seller-info-form');
const productForm = document.getElementById('product-form');
const newsletterForm = document.getElementById('newsletter-form');
const reservationNoteContainer = document.getElementById('reservation-note-container');
const isReservationCheckbox = document.getElementById('product-is-reservation');


// --- 認証 (NEW) ---

/** ログアウト処理 */
async function handleLogout() {
    try {
        await signOut(auth);
        showNotification('ログアウトしました。');
        window.location.href = 'admin-login.html'; // ログインページに戻す
    } catch (error) {
        console.error("ログアウトエラー:", error);
        showNotification('ログアウトに失敗しました。');
    }
}

/** ヘッダーの管理者情報を描画 */
function renderAdminHeader() {
    if (!currentUserEmail) return;
    adminUserInfoEl.innerHTML = `
        <span class="text-sm hidden sm:inline">${currentUserEmail} 様</span>
        <button id="logout-button" class="text-sm hover:underline flex items-center">
            <i data-lucide="log-out" class="w-4 h-4 mr-1"></i>
            ログアウト
        </button>
    `;
    // ログアウトボタンにイベントリスナーを追加
    document.getElementById('logout-button').addEventListener('click', handleLogout);
}


// --- レンダリング（描画）関数 ---

/** 事業者情報を再描画します */
function renderSellerInfo() {
    sellerInfoDisplayEl.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div class="flex-shrink-0">
                <img class="h-24 w-24 rounded-full object-cover" src="${sellerInfo.imageUrl || 'https://placehold.co/150x150/e2e8f0/cbd5e1?text=No+Image'}" alt="${sellerInfo.name || '事業者名'}">
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900">${sellerInfo.name || '（事業者名未設定）'}</h3>
                <p class="text-sm text-gray-600 mt-1">${sellerInfo.description || '（説明未設定）'}</p>
                <p class="text-sm text-gray-500 mt-2"><strong>連絡先:</strong> ${sellerInfo.contact || '（連絡先未設定）'}</p>
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sellerProducts.map(p => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img class="h-10 w-10 rounded-full object-cover" src="${p.imageUrl || 'https://placehold.co/100x100/e2e8f0/cbd5e1?text=No+Image'}" alt="${p.name}">
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${p.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥${p.price.toLocaleString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${p.isReservation ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">予約販売</span>` : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">通常販売</span>`}
                            </td>
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
            ${newsletters.map(n => {
                // FirestoreのTimestampオブジェクトをJSのDateに変換し、フォーマット
                const sentDate = n.sentDate && n.sentDate.toDate 
                                ? n.sentDate.toDate().toISOString().split('T')[0] 
                                : '（日付不明）';
                return `
                    <div class="p-4 border rounded-md overflow-hidden">
                        ${n.imageUrl ? `<img src="${n.imageUrl}" alt="${n.subject}" class="w-full h-32 object-cover mb-4 rounded">` : ''}
                        <p class="font-semibold text-gray-800">${n.subject}</p>
                        <p class="text-sm text-gray-500 truncate mt-1">${n.body}</p>
                        <p class="text-xs text-gray-400 text-right mt-2">配信日: ${sentDate}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// --- Firestoreからのデータ読み込み (認証IDを使用) ---

/** Firestoreから事業者情報を読み込みます */
async function loadSellerInfoFromFirestore() {
    if (!currentSellerId) return; // 認証ガード
    try {
        const docRef = doc(db, "sellers", currentSellerId); // ログインユーザーのUIDをIDとして使用
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            sellerInfo = docSnap.data();
        } else {
            console.log("事業者情報ドキュメントがありません。新規作成されます。");
            sellerInfo = {}; // データがない場合は空のオブジェクト
        }
    } catch (error) {
        console.error("Firestoreからの事業者情報読み込みに失敗しました:", error);
        showNotification("事業者情報の読み込みに失敗しました。");
    }
}

/** Firestoreから商品データを読み込みます */
async function loadProductsFromFirestore() {
    if (!currentSellerId) return; // 認証ガード
    try {
        // ログイン中のsellerIdに一致する商品のみをクエリ
        const q = query(collection(db, "products"), where("sellerId", "==", currentSellerId));
        const querySnapshot = await getDocs(q);
        sellerProducts = []; // 配列をリセット
        querySnapshot.forEach((doc) => {
            sellerProducts.push({
                id: doc.id, 
                ...doc.data()
            });
        });
    } catch (error) {
        console.error("Firestoreからの商品読み込みに失敗しました:", error);
        showNotification("商品の読み込みに失敗しました。");
    }
}

/** Firestoreからメルマガデータを読み込みます */
async function loadNewslettersFromFirestore() {
    if (!currentSellerId) return; // 認証ガード
    try {
        // ログイン中のsellerIdに一致するメルマガのみをクエリ (新しい順)
        const q = query(collection(db, "newsletters"), 
                        where("sellerId", "==", currentSellerId), 
                        orderBy("sentDate", "desc"));
        const querySnapshot = await getDocs(q);
        newsletters = []; // 配列をリセット
        querySnapshot.forEach((doc) => {
            newsletters.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.error("Firestoreからのメルマガ読み込みに失敗しました:", error);
        showNotification("メルマガの読み込みに失敗しました。");
    }
}


/** UI全体を更新します */
async function updateUI() {
    if (!currentSellerId) return; // 認証ガード
    
    // 3つのデータ（事業者情報、商品、メルマガ）を並行して読み込む
    try {
        await Promise.all([
            loadSellerInfoFromFirestore(),
            loadProductsFromFirestore(),
            loadNewslettersFromFirestore()
        ]);
    } catch (error) {
        console.error("データの並行読み込みに失敗しました:", error);
    }
    
    // すべてのデータを読み込んだ後に各セクションを描画
    renderAdminHeader(); // ヘッダー（ログアウトボタン）
    renderSellerInfo();
    renderProductList();
    renderNewsletterList();
    lucide.createIcons();
}

// --- モーダル管理 ---

/** 事業者情報モーダルを表示/非表示にします */
function toggleSellerInfoModal(show) {
    if (show) {
        // 現在の(読み込んだ)情報をフォームにセット
        document.getElementById('seller-name').value = sellerInfo.name || '';
        document.getElementById('seller-image-url').value = sellerInfo.imageUrl || '';
        document.getElementById('seller-description').value = sellerInfo.description || '';
        document.getElementById('seller-contact').value = sellerInfo.contact || '';
        sellerInfoModalEl.classList.remove('hidden');
    } else {
        sellerInfoModalEl.classList.add('hidden');
    }
}

/** 商品モーダルを表示/非表示にします */
function toggleProductModal(show, product = null) {
    productForm.reset();
    reservationNoteContainer.classList.add('hidden'); // フォームリセット時にノート欄も隠す

    if (show) {
        if (product) {
            // 編集モード
            document.getElementById('modal-title').textContent = '商品を編集';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-image-url').value = product.imageUrl || '';
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-price').value = product.price;
            isReservationCheckbox.checked = product.isReservation || false;
            
            if (product.isReservation) {
                document.getElementById('product-reservation-note').value = product.reservationNote || '';
                reservationNoteContainer.classList.remove('hidden');
            }
        } else {
            // 新規追加モード
            document.getElementById('modal-title').textContent = '新規商品を追加';
            document.getElementById('product-id').value = ''; // IDをクリア
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

// --- イベントハンドラとロジック (Firestoreへの書き込み) ---

/** 事業者情報フォームが送信されたときの処理 */
async function handleSellerInfoFormSubmit(event) {
    event.preventDefault();
    if (!currentSellerId) return;

    const infoData = {
        name: document.getElementById('seller-name').value,
        imageUrl: document.getElementById('seller-image-url').value,
        description: document.getElementById('seller-description').value,
        contact: document.getElementById('seller-contact').value,
    };
    
    try {
        const docRef = doc(db, "sellers", currentSellerId); // ログインユーザーのUIDをIDとして使用
        await setDoc(docRef, infoData, { merge: true });
        
        showNotification('事業者情報を更新しました。');
        toggleSellerInfoModal(false);
        
        sellerInfo = { ...sellerInfo, ...infoData };
        renderSellerInfo(); 
        
    } catch (error) {
        console.error("事業者情報の保存に失敗しました:", error);
        showNotification('事業者情報の更新に失敗しました。');
    }
}

/** 商品フォームが送信されたときの処理 */
async function handleProductFormSubmit(event) {
    event.preventDefault();
    if (!currentSellerId) return;
    
    const id = document.getElementById('product-id').value;
    const price = parseInt(document.getElementById('product-price').value);
    const isReservation = isReservationCheckbox.checked;

    if (isNaN(price) || price <= 0) {
        showNotification('有効な価格を入力してください。');
        return;
    }

    const productData = {
        name: document.getElementById('product-name').value,
        imageUrl: document.getElementById('product-image-url').value || '',
        description: document.getElementById('product-description').value || '',
        price: price,
        isReservation: isReservation,
        reservationNote: isReservation ? document.getElementById('product-reservation-note').value : '',
        sellerId: currentSellerId // ★ 認証された出品者のIDを必ず含める
    };

    try {
        if (id) {
            // 更新処理
            const productRef = doc(db, "products", id);
            await setDoc(productRef, productData, { merge: true }); 
            showNotification('商品を更新しました。');
        } else {
            // 新規追加処理
            await addDoc(collection(db, "products"), productData);
            showNotification('商品を追加しました。');
        }
        toggleProductModal(false);
        updateUI(); // リストを再読み込み・再描画
    } catch (error) {
        console.error("商品データの保存に失敗しました:", error);
        showNotification('商品の保存に失敗しました。');
    }
}

/** 商品削除処理 */
async function handleDeleteProduct(productId) {
    if (!confirm('この商品を本当に削除しますか？')) {
        return;
    }
    // (セキュリティ注意: 本来はFirestoreルールで、
    //  このproductIdが本当にcurrentSellerIdのものかチェックするべき)
    try {
        await deleteDoc(doc(db, "products", productId));
        showNotification('商品を削除しました。');
        updateUI(); // リストを再読み込み・再描画
    } catch (error) {
        console.error("商品の削除に失敗しました:", error);
        showNotification('商品の削除に失敗しました。');
    }
}


/** メルマガフォームが送信されたときの処理 */
async function handleNewsletterFormSubmit(event) {
    event.preventDefault();
    if (!currentSellerId) return;
    
    const newsletterData = {
        subject: document.getElementById('newsletter-subject').value,
        body: document.getElementById('newsletter-body').value,
        imageUrl: document.getElementById('newsletter-image-url').value || '',
        sentDate: Timestamp.now(), // サーバーの現在時刻を保存
        sellerId: currentSellerId // ★ 認証された出品者のIDを必ず含める
    };

    try {
        await addDoc(collection(db, "newsletters"), newsletterData);
        showNotification('メルマガを配信しました（保存しました）。');
        toggleNewsletterModal(false);
        updateUI(); // リストを再読み込み・再描画
    } catch (error) {
        console.error("メルマガの保存に失敗しました:", error);
        showNotification('メルマガの保存に失敗しました。');
    }
}

// --- イベントリスナーの設定 (認証ガード内部で実行) ---
document.addEventListener('DOMContentLoaded', () => {

    // ★★★ 認証状態の監視 ★★★
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // --- ユーザーがログインしている ---
            currentSellerId = user.uid; // グローバル変数にUIDをセット
            currentUserEmail = user.email; // グローバル変数にEmailをセット

            // 管理画面を表示
            sellerAppContainer.classList.remove('hidden');

            // --- ログイン成功後に、すべてのイベントリスナーを設定 ---

            // モーダル開閉ボタン
            document.getElementById('edit-info-button').addEventListener('click', () => toggleSellerInfoModal(true));
            document.getElementById('add-product-button').addEventListener('click', () => toggleProductModal(true));
            document.getElementById('add-newsletter-button').addEventListener('click', () => toggleNewsletterModal(true));
            
            document.getElementById('seller-info-modal-close-button').addEventListener('click', () => toggleSellerInfoModal(false));
            document.getElementById('modal-close-button').addEventListener('click', () => toggleProductModal(false));
            document.getElementById('newsletter-modal-close-button').addEventListener('click', () => toggleNewsletterModal(false));

            // フォーム送信イベント
            sellerInfoForm.addEventListener('submit', handleSellerInfoFormSubmit);
            productForm.addEventListener('submit', handleProductFormSubmit);
            newsletterForm.addEventListener('submit', handleNewsletterFormSubmit);

            // 商品モーダル内の予約チェックボックス連動
            isReservationCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    reservationNoteContainer.classList.remove('hidden');
                } else {
                    reservationNoteContainer.classList.add('hidden');
                }
            });

            // 商品リストのイベント委任（編集・削除）
            productListEl.addEventListener('click', (event) => {
                const target = event.target.closest('button'); 
                if (!target) return;

                const productId = target.dataset.productId;
                if (!productId) return;

                if (target.matches('.edit-product-button')) {
                    const productToEdit = sellerProducts.find(p => p.id === productId);
                    if (productToEdit) {
                        toggleProductModal(true, productToEdit);
                    }
                }

                if (target.matches('.delete-product-button')) {
                    handleDeleteProduct(productId);
                }
            });

            // --- 認証OKなので、全データをロードしてUIを初期表示 ---
            updateUI(); 

        } else {
            // --- ユーザーがログインしていない ---
            console.log("管理者未ログイン。ログインページにリダイレクトします。");
            // ログインページに強制リダイレクト
            window.location.replace('admin-login.html');
        }
    });
});