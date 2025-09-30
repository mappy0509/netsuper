// --- 共通のデータ ---

// 商品リスト（サイト全体で共有）
// このリストを編集すると、お客様向けページの商品表示が更新されます。
const products = [
    { 
        id: 1, 
        name: '野菜セットA', 
        imageUrl: 'https://placehold.co/300x300/84cc16/ffffff?text=野菜セットA', 
        price: 2500, 
        rating: 4.5, 
        reviews: 120 
    },
    { 
        id: 2, 
        name: '野菜セットB', 
        imageUrl: 'https://placehold.co/300x300/22c55e/ffffff?text=野菜セットB', 
        price: 3500, 
        rating: 5, 
        reviews: 350 
    },
    { 
        id: 3, 
        name: '熊本県産森のくまさん 10kg', 
        imageUrl: 'https://placehold.co/300x300/f59e0b/ffffff?text=お米+10kg', 
        price: 4000, 
        rating: 5, 
        reviews: 98 
    },
    { 
        id: 4, 
        name: '熊本県産森のくまさん 20kg', 
        imageUrl: 'https://placehold.co/300x300/f59e0b/ffffff?text=お米+20kg', 
        price: 7800, 
        rating: 5, 
        reviews: 154 
    },
    { 
        id: 5, 
        name: '熊本県産森のくまさん 30kg', 
        imageUrl: 'https://placehold.co/300x300/f59e0b/ffffff?text=お米+30kg', 
        price: 11000, 
        rating: 5, 
        reviews: 213 
    },
];


// --- 共通の関数 ---

/**
 * 画面下部に通知を表示します。
 * この関数はどのページのJavaScriptファイルからでも呼び出せます。
 * @param {string} message 表示するメッセージ
 */
function showNotification(message) {
    // HTML内に <div id="notification">...</div> が存在することを前提とします。
    const notificationEl = document.getElementById('notification');
    if (!notificationEl) {
        console.error('Notification element not found!');
        return;
    }
    
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    notificationEl.classList.add('animate-fade-in-out');
    
    // 3秒後に通知を非表示にするタイマー
    setTimeout(() => {
        notificationEl.style.display = 'none';
        notificationEl.classList.remove('animate-fade-in-out');
    }, 3000);
}

