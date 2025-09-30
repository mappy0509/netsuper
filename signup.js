// Firebase関連のモジュールと共通関数をインポート
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { showNotification } from './shared.js';

// --- DOM要素の取得 ---
const signupForm = document.getElementById('signup-form');
const successMessageEl = document.getElementById('success-message');
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
async function handleSignupSubmit(event) {
    event.preventDefault(); // デフォルトのフォーム送信をキャンセル

    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData.entries());

    // パスワードと確認用パスワードが一致するかチェック
    if (data.password !== data['password-confirm']) {
        showNotification('パスワードが一致しません。');
        return; // 一致しない場合はここで処理を中断
    }
    
    // 電話番号が入力されているかのチェックは、HTMLのrequired属性に任せるため、JavaScript側では不要になりました。

    try {
        // 1. Firebase Authenticationにユーザーを作成
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // 2. Firestoreにユーザーの追加情報を保存
        // パスワード情報は除外して保存
        const userData = {
            'last-name': data['last-name'],
            'first-name': data['first-name'],
            'email': data.email,
            'phone': data.phone,
            'postal-code': data['postal-code'],
            'prefecture': data.prefecture,
            'city': data.city,
            'street': data.street,
            'apartment': data.apartment
        };
        
        // "users"コレクションに、認証のUIDをドキュメントIDとしてデータを保存
        await setDoc(doc(db, "users", user.uid), userData);

        // 登録成功を通知
        showNotification('登録が完了しました！');

        // 成功メッセージを表示
        signupForm.classList.add('hidden');
        successMessageEl.classList.remove('hidden');
        lucide.createIcons(); // 成功アイコンを再描画

    } catch (error) {
        console.error("登録エラー:", error.code, error.message);
        if (error.code === 'auth/email-already-in-use') {
            showNotification('このメールアドレスは既に使用されています。');
        } else if (error.code === 'auth/weak-password') {
            showNotification('パスワードは6文字以上で設定してください。');
        } else {
            showNotification('登録に失敗しました。');
        }
    }
}


// --- イベントリスナーの設定 ---

document.addEventListener('DOMContentLoaded', () => {
    populatePrefectures();
    searchAddressButton.addEventListener('click', handleSearchAddress);
    signupForm.addEventListener('submit', handleSignupSubmit);
});

