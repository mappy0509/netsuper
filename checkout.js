// Firebaseのモジュールをインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-functions.js";
// shipping.js から送料計算に必要な関数をインポート
import { getShippingFee, getPrefectureList } from './shipping.js';

// 【重要】firebase-config.jsと同じ設定情報をここにコピーしてください。
const firebaseConfig = {
     apiKey: "AIzaSyDcjT8n7ptY3DU6vUGUGEnYCUXWh-vIgCw",
    authDomain: "net-super.firebaseapp.com",
    projectId: "net-super",
    storageBucket: "net-super.firebasestorage.app",
    messagingSenderId: "389363291629",
    appId: "1:389363291629:web:1782340b1bf92bb69a03e4"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'asia-northeast1'); // リージョンを東京に設定

// --- グローバル変数 ---
let cart = [];
let subtotalPrice = 0;
let currentShippingFee = null; // nullは「未計算」の状態
let stripe, elements, paymentIntentId, clientSecret; // Stripe関連の変数をグローバルに

// --- DOM要素の取得 ---
let orderSummaryEl, paymentForm, submitButton, paymentMessage, emailInput;
let prefectureSelect, orderSubtotalEl, orderShippingFeeEl, orderTotalEl;

// --- Firebase Cloud Functions の呼び出し準備 ---
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
const updatePaymentIntent = httpsCallable(functions, 'updatePaymentIntent');


/** 注文概要（金額）の表示を更新します */
function updateOrderSummary() {
    // 小計を表示
    orderSubtotalEl.textContent = `¥${subtotalPrice.toLocaleString()}`;

    if (currentShippingFee === null || !prefectureSelect.value) {
        // 未計算または未選択
        orderShippingFeeEl.textContent = '---';
        orderTotalEl.textContent = `¥${subtotalPrice.toLocaleString()}`;
        // 決済IDがまだない、または送料が未計算なら支払いを無効化
        submitButton.disabled = true;
    } else {
        // 送料計算済み
        const totalPrice = subtotalPrice + currentShippingFee;
        orderShippingFeeEl.textContent = `¥${currentShippingFee.toLocaleString()}`;
        orderTotalEl.textContent = `¥${totalPrice.toLocaleString()}`;
        
        // 決済IDがあり、送料も計算済みの場合のみ支払いを有効化
        if (paymentIntentId) {
            submitButton.disabled = false;
        }
    }
}

/** 都道府県が変更されたときの処理（決済処理の初期化・更新） */
async function handlePrefectureChange() {
    const selectedPrefecture = prefectureSelect.value;
    
    // 1. 先に画面の表示を更新
    currentShippingFee = getShippingFee(selectedPrefecture);
    updateOrderSummary();

    if (!selectedPrefecture) {
        // 「選択してください」に戻した場合
        showMessage("配送先の都道府県を選択してください。", "error");
        return;
    }
    
    if (currentShippingFee === null) {
        // 無効な地域が選ばれた場合
        showMessage("選択された地域は配送対象外です。", "error");
        return;
    }

    setLoading(true);
    
    try {
        if (!paymentIntentId) {
            // --- 1. 決済の「新規作成」 ---
            // (これが初めての有効な都道府県選択)
            showMessage("決済情報を準備しています...", "success");
            
            const response = await createPaymentIntent({ 
                cart: cart,
                prefecture: selectedPrefecture
            });
            
            clientSecret = response.data.clientSecret;
            paymentIntentId = clientSecret.split('_secret_')[0]; // 'pi_...' の部分をIDとして保存
            
            elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
            
            showMessage("決済情報の準備ができました。", "success");

        } else {
            // --- 2. 決済の「更新」 ---
            // (すでに決済フォームが表示された後の都道府県変更)
            showMessage("送料を更新しています...", "success");

            await updatePaymentIntent({
                cart: cart,
                prefecture: selectedPrefecture,
                paymentIntentId: paymentIntentId
            });
            
            showMessage("送料を更新しました。", "success");
        }
    } catch (error) {
        console.error("決済処理の準備/更新に失敗:", error);
        showMessage("決済処理の準備に失敗しました。時間をおいて再度お試しください。", "error");
        paymentIntentId = null; // エラー時はリセット
    } finally {
        setLoading(false);
        updateOrderSummary(); // 最終的なボタンの状態を更新
    }
}

/** フォーム送信（支払い確定）時の処理 */
async function handlePaymentSubmit(e) {
    e.preventDefault();

    // 決済フォームが初期化されていない、または都道府県が未選択
    if (!elements || !paymentIntentId || !prefectureSelect.value) {
        showMessage("お支払いの準備ができていません。都道府県を選択してください。", "error");
        return;
    }
    
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: `${window.location.origin}/order-confirmation.html`,
            receipt_email: emailInput.value,
        },
    });
    
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message, "error");
    } else if (error) {
        showMessage("予期せぬエラーが発生しました。", "error");
    }

    setLoading(false);
}


// --- ヘルパー関数 ---
function showMessage(messageText, type = "error") {
    paymentMessage.classList.remove('hidden');
    paymentMessage.textContent = messageText;
    
    if (type === "success") {
        paymentMessage.classList.remove('text-red-500');
        paymentMessage.classList.add('text-green-600');
    } else {
        paymentMessage.classList.remove('text-green-600');
        paymentMessage.classList.add('text-red-500');
    }
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    prefectureSelect.disabled = isLoading; // ★ 通信中は都道府県も変更不可にする
    
    document.getElementById('button-text').textContent = isLoading 
        ? "処理中..." 
        : "支払いを確定する";
}


// --- ページ読み込み時の初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Stripeインスタンスをグローバルに作成
    // 【重要】Stripeのダッシュボードで取得した「公開可能キー」を設定してください。
    stripe = Stripe('pk_test_51PFTvtRpM6FFLMMYxR8je5251gCtlQjtnC2w71a0yCV7y2AWyh7Y7cOaJWW2wKTL2zLp3h2Fq4p00VfA2F8zLCTa00o1VqzL3s'); 

    // --- DOM要素の取得 (グローバル変数に代入) ---
    orderSummaryEl = document.getElementById('order-summary');
    paymentForm = document.getElementById('payment-form');
    submitButton = document.getElementById('submit-button');
    paymentMessage = document.getElementById('payment-message');
    emailInput = document.getElementById('email');
    prefectureSelect = document.getElementById('prefecture-select');
    orderSubtotalEl = document.getElementById('order-subtotal');
    orderShippingFeeEl = document.getElementById('order-shipping-fee');
    orderTotalEl = document.getElementById('order-total');

    // --- 都道府県プルダウンの初期化 ---
    const prefectures = getPrefectureList();
    prefectures.forEach(pref => {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        prefectureSelect.appendChild(option);
    });

    // --- カート情報とユーザー情報の読み込み ---
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userEmail = localStorage.getItem('userEmail') || '';
    const userPrefecture = localStorage.getItem('userPrefecture') || '';

    emailInput.value = userEmail;
    
    if (userPrefecture) {
        prefectureSelect.value = userPrefecture;
    }

    // --- カート内容の描画と小計の計算 ---
    if (cart.length === 0) {
        orderSummaryEl.innerHTML = '<p class="text-gray-500">カートは空です。トップページへお戻りください。</p>';
        submitButton.disabled = true;
        prefectureSelect.disabled = true;
        return;
    }

    orderSummaryEl.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm py-2 border-b">
            <div class="flex items-center">
                <img src="${item.imageUrl || 'https://placehold.co/100x100/e2e8f0/cbd5e1?text=No+Image'}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md mr-4">
                <div>
                    <p class="text-slate-800 font-semibold">${item.name} (x${item.quantity})</p>
                </div>
            </div>
            <p class="text-slate-700">¥${(item.price * item.quantity).toLocaleString()}</p>
        </div>
    `).join('');

    subtotalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // --- イベントリスナーの設定 ---
    
    // ★ 決済フォームの初期化・更新は、都道府県が変更された時に実行
    prefectureSelect.addEventListener('change', handlePrefectureChange);
    
    // 支払い確定ボタンの処理
    paymentForm.addEventListener('submit', handlePaymentSubmit);
    
    // --- 初期表示の実行 ---
    if (prefectureSelect.value) {
        // ページ読み込み時に既に都道府県が選択されていた場合 (例: 登録済み住所)
        // 変更イベントを強制的に発火させて、決済処理を初期化する
        prefectureSelect.dispatchEvent(new Event('change'));
    } else {
        // まだ都道府県が選択されていない場合
        updateOrderSummary();
        showMessage("配送先の都道府県を選択してください。", "error");
    }
});