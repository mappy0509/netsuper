// --- 定数 ---
const YEARLY_PRICE = 10000;
// 年間プランが月間プラン合計より約10%お得になるように月額料金を計算
const MONTHLY_PRICE = Math.round(YEARLY_PRICE / (12 * 0.9)); // 926円

// --- DOM要素の取得 ---
const planSelectionEl = document.getElementById('plan-selection');
const registrationFormEl = document.getElementById('registration-form');
const notificationEl = document.getElementById('notification');
const planCards = document.querySelectorAll('.plan-card');

// --- 状態管理 ---
let selectedPlan = null;

// --- イベントハンドラとロジック ---

/**
 * HTMLに表示されている価格を更新します。
 */
function updatePriceDisplay() {
    const monthlyPriceEl = document.querySelector('[data-plan="monthly"] p');
    const yearlyPriceEl = document.querySelector('[data-plan="yearly"] p');

    if (monthlyPriceEl) {
        monthlyPriceEl.innerHTML = `¥${MONTHLY_PRICE.toLocaleString()}<span class="text-lg font-normal">/月</span>`;
    }

    if (yearlyPriceEl) {
        yearlyPriceEl.innerHTML = `¥${YEARLY_PRICE.toLocaleString()}<span class="text-lg font-normal">/年</span>`;
    }
}


/**
 * 通知を表示します。
 * @param {string} message - 表示するメッセージ
 */
function showNotification(message) {
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    notificationEl.classList.add('animate-fade-in-out');
    
    // 3秒後に通知を非表示にする
    setTimeout(() => {
        notificationEl.style.display = 'none';
        notificationEl.classList.remove('animate-fade-in-out');
    }, 3000);
}

/**
 * プランカードがクリックされたときの処理
 * @param {Event} event - クリックイベント
 */
function handlePlanClick(event) {
    const clickedCard = event.currentTarget;
    selectedPlan = clickedCard.dataset.plan;

    // すべてのカードから選択状態のスタイルを削除
    planCards.forEach(card => {
        card.classList.remove('border-emerald-500', 'ring-2', 'ring-emerald-200');
        card.classList.add('border-gray-300');
    });

    // クリックされたカードに選択状態のスタイルを適用
    clickedCard.classList.remove('border-gray-300');
    clickedCard.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-200');
    
    // 登録フォームを表示
    registrationFormEl.classList.remove('hidden');
    
    // フォームまでスクロール
    registrationFormEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 登録フォームが送信されたときの処理
 * @param {Event} event - 送信イベント
 */
function handleRegistrationSubmit(event) {
    event.preventDefault(); // デフォルトのフォーム送信をキャンセル

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (!name || !email || !selectedPlan) {
        showNotification('すべての項目を入力してください。');
        return;
    }
    
    console.log('登録情報:', {
        name,
        email,
        plan: selectedPlan,
    });

    // 登録成功の通知を表示
    showNotification('会員登録が完了しました！ストアページに戻ります。');
    
    // 2秒後にストアページにリダイレクト
    setTimeout(() => {
        window.location.href = 'customer.html';
    }, 2000);
}


// --- イベントリスナーの設定 ---

document.addEventListener('DOMContentLoaded', () => {
    // 価格表示を更新
    updatePriceDisplay();

    // 各プランカードにクリックイベントリスナーを設定
    planCards.forEach(card => {
        card.addEventListener('click', handlePlanClick);
    });

    // 登録フォームに送信イベントリスナーを設定
    registrationFormEl.addEventListener('submit', handleRegistrationSubmit);
    
    // Lucideアイコンを初期化
    lucide.createIcons();
});

