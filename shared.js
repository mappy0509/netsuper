// --- 共通データ ---

// 商品リスト
const products = [
    {
        id: 1,
        name: '野菜セットA',
        price: 3000,
        imageUrl: 'https://placehold.co/300x300/48bb78/ffffff?text=野菜セットA',
        description: '旬の新鮮な野菜を詰め合わせた基本的なセットです。季節ごとの味わいをお楽しみください。(5〜6品目)'
    },
    {
        id: 2,
        name: '野菜セットB',
        price: 5000,
        imageUrl: 'https://placehold.co/300x300/81e6d9/ffffff?text=野菜セットB',
        description: '旬の野菜に加えて、少し珍しい野菜も入ったデラックスなセットです。お料理の幅が広がります。(8〜10品目)'
    },
    {
        id: 3,
        name: '熊本県産森のくまさん 30kg',
        price: 13000,
        imageUrl: 'https://placehold.co/300x300/f6e05e/ffffff?text=お米+30kg',
        description: 'もっちりとした食感と甘みが特徴の「森のくまさん」。炊きたてはもちろん、冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州(無料), 中国/四国(200円), 近畿/中部(250円), 東北(350円), 沖縄(400円), 関東(600円), 北海道(1000円)'
    },
    {
        id: 4,
        name: '熊本県産森のくまさん 20kg',
        price: 9000,
        imageUrl: 'https://placehold.co/300x300/f6e05e/ffffff?text=お米+20kg',
        description: 'もっちりとした食感と甘みが特徴の「森のくまさん」。炊きたてはもちろん、冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州(無料), 中国/四国(200円), 近畿/中部(250円), 東北(350円), 沖縄(400円), 関東(600円), 北海道(1000円)'
    },
    {
        id: 5,
        name: '熊本県産森のくまさん 10kg',
        price: 4500,
        imageUrl: 'https://placehold.co/300x300/f6e05e/ffffff?text=お米+10kg',
        description: 'もっちりとした食感と甘みが特徴の「森のくまさん」。炊きたてはもちろん、冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州(無料), 中国/四国(200円), 近畿/中部(250円), 東北(350円), 沖縄(400円), 関東(600円), 北海道(1000円)'
    }
];

// --- 共通関数 ---

/**
 * 通知を表示します。
 * @param {string} message - 表示するメッセージ
 */
function showNotification(message) {
    const notificationEl = document.getElementById('notification');
    if (!notificationEl) return;
    
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    notificationEl.classList.add('animate-fade-in-out');
    
    setTimeout(() => {
        notificationEl.style.display = 'none';
        notificationEl.classList.remove('animate-fade-in-out');
    }, 3000);
}

