// --- DOM要素の取得 ---
const signupForm = document.getElementById('signup-form');
const postalCodeInput = document.getElementById('postal-code');
const searchAddressButton = document.getElementById('search-address-button');
const prefectureSelect = document.getElementById('prefecture');
const cityInput = document.getElementById('city');

// --- 定数データ ---
const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// --- 初期化処理 ---

/**
 * 都道府県の選択肢をプルダウンに追加します。
 */
function populatePrefectures() {
    prefectures.forEach(pref => {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        prefectureSelect.appendChild(option);
    });
}

// --- イベントハンドラとロジック ---

/**
 * 郵便番号から住所を検索する処理（ダミー）
 * 実際のアプリケーションでは、APIを呼び出して住所を取得します。
 */
function handleSearchAddress() {
    const postalCode = postalCodeInput.value;
    if (postalCode.length >= 7) {
        // ダミーデータで自動入力
        prefectureSelect.value = '東京都';
        cityInput.value = '千代田区';
        showNotification('住所を自動入力しました。');
    } else {
        showNotification('7桁の郵便番号を入力してください。');
    }
}

/**
 * 登録フォームが送信されたときの処理
 * @param {Event} event - 送信イベント
 */
function handleSignupSubmit(event) {
    event.preventDefault(); // デフォルトのフォーム送信をキャンセル

    // フォームから入力データを取得
    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData.entries());

    // バリデーション（ここでは簡単なチェックのみ）
    if (!data['last-name'] || !data['first-name'] || !data.email || !data.password) {
        showNotification('必須項目をすべて入力してください。');
        return;
    }
    
    // 登録処理が成功したと仮定
    console.log('登録情報:', data);

    // 登録成功の通知を表示
    showNotification('会員登録が完了しました！ストアページに戻ります。');
    
    // 2秒後にストアページ（index.html）にリダイレクト
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// --- イベントリスナーの設定 ---

document.addEventListener('DOMContentLoaded', () => {
    // 都道府県プルダウンを初期化
    populatePrefectures();

    // 住所検索ボタンにクリックイベントを設定
    searchAddressButton.addEventListener('click', handleSearchAddress);

    // 登録フォームに送信イベントを設定
    signupForm.addEventListener('submit', handleSignupSubmit);
});
