// Firebaseのモジュールをインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-functions.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    // --- Stripeの初期化 ---
    // 【重要】Stripeのダッシュボードで取得した「公開可能キー」を設定してください。
    const stripe = Stripe('pk_test_51PFTvtRpM6FFLMMYxR8je5251gCtlQjtnC2w71a0yCV7y2AWyh7Y7cOaJWW2wKTL2zLp3h2Fq4p00VfA2F8zLCTa00o1VqzL3s'); 

    // --- DOM要素の取得 ---
    const orderSummaryEl = document.getElementById('order-summary');
    const orderTotalEl = document.getElementById('order-total');
    const paymentForm = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-button');
    const paymentMessage = document.getElementById('payment-message');
    const emailInput = document.getElementById('email');

    // --- カート情報の読み込みと描画 ---
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userEmail = localStorage.getItem('userEmail') || '';
    emailInput.value = userEmail;

    if (cart.length === 0) {
        orderSummaryEl.innerHTML = '<p class="text-gray-500">カートは空です。トップページへお戻りください。</p>';
        submitButton.disabled = true;
        return;
    }

    // カートの中身を描画
    orderSummaryEl.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm py-2 border-b">
            <div class="flex items-center">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md mr-4">
                <div>
                    <p class="text-slate-800 font-semibold">${item.name} (x${item.quantity})</p>
                </div>
            </div>
            <p class="text-slate-700">¥${(item.price * item.quantity).toLocaleString()}</p>
        </div>
    `).join('');

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    orderTotalEl.innerHTML = `
        <div class="flex justify-between">
            <span>ご請求額</span>
            <span>¥${totalPrice.toLocaleString()} (税込)</span>
        </div>
    `;

    // --- Stripe決済処理 ---
    setLoading(true);
    let elements;

    try {
        // サーバーサイドのCloud Functionを呼び出してPaymentIntentを作成
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        const response = await createPaymentIntent({ cart: cart });
        const { clientSecret } = response.data;
        
        if (!clientSecret) {
            throw new Error("サーバーからclientSecretを取得できませんでした。");
        }

        elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

    } catch (error) {
        console.error("決済の初期化に失敗しました:", error);
        showMessage("決済の準備に失敗しました。時間をおいて再度お試しください。");
        setLoading(false); // setLoading(false)をエラー時にも呼ぶ
        return;
    } finally {
        setLoading(false);
    }

    // フォーム送信時の処理
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // 決済完了後のリダイレクト先URL
                return_url: `${window.location.origin}/order-confirmation.html`,
                receipt_email: emailInput.value,
            },
        });
        
        // 通常、この処理はリダイレクトされるため実行されませんが、
        // 即時エラー（例：カード情報が無効）が発生した場合に実行されます。
        if (error.type === "card_error" || error.type === "validation_error") {
            showMessage(error.message);
        } else {
            showMessage("予期せぬエラーが発生しました。");
        }

        setLoading(false);
    });

    // --- ヘルパー関数 ---
    function showMessage(messageText) {
        paymentMessage.classList.remove('hidden');
        paymentMessage.textContent = messageText;
    }

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        document.getElementById('button-text').textContent = isLoading ? "処理中..." : "支払いを確定する";
    }
});

