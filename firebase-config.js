// Firebase SDKから必要な関数をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// あなたのウェブアプリのFirebase設定情報
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

// 他のファイルで使えるように、FirestoreとAuthenticationのインスタンスをエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);

