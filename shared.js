/**
 * 複数のページで共有する商品データや関数を定義します。
 */

// 商品リストのデータを再度定義します。
// Firebaseへの接続が不要になったため、このデータを正として扱います。
export const products = [
    { 
        id: 'veg-a', 
        name: '野菜セットA（お試し）', 
        price: 2980, 
        imageUrl: 'https://placehold.co/300x300/a7f3d0/166534?text=野菜セットA',
        description: '旬の新鮮野菜を5〜6種類詰め合わせたお試しセットです。',
        isReservation: false,
    },
    { 
        id: 'veg-b', 
        name: '野菜セットB（満足）', 
        price: 4980, 
        imageUrl: 'https://placehold.co/300x300/6ee7b7/14532d?text=野菜セットB',
        description: '旬の新鮮野菜を8〜10種類。2〜4人家族におすすめの満足セット。',
        isReservation: false,
    },
    { 
        id: 'rice-30', 
        name: '熊本県産 森のくまさん 30kg', 
        price: 11000, 
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米30kg',
        description: 'もちもちとした食感と甘みが特徴。冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州・熊本: 無料 / 四国・中国: 200円 / 近畿・中部: 250円 / 東北: 350円 / 関東: 600円 / 北海道: 1,000円 / 沖縄: 400円',
    },
    { 
        id: 'rice-20', 
        name: '熊本県産 森のくまさん 20kg', 
        price: 7500, 
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米20kg',
        description: 'もちもちとした食感と甘みが特徴。冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州・熊本: 無料 / 四国・中国: 200円 / 近畿・中部: 250円 / 東北: 350円 / 関東: 600円 / 北海道: 1,000円 / 沖縄: 400円',
    },
    { 
        id: 'rice-10', 
        name: '熊本県産 森のくまさん 10kg', 
        price: 4000, 
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米10kg',
        description: 'もちもちとした食感と甘みが特徴。冷めても美味しいお米です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
        shippingInfo: '九州・熊本: 無料 / 四国・中国: 200円 / 近畿・中部: 250円 / 東北: 350円 / 関東: 600円 / 北海道: 1,000円 / 沖縄: 400円',
    },
];


/**
 * 画面下部に通知メッセージを表示します。
 * @param {string} message 表示するメッセージ
 */
export function showNotification(message) {
    const notificationEl = document.getElementById('notification');
    // notification要素がないページでは何もしない
    if (!notificationEl) return;

    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    notificationEl.classList.add('animate-fade-in-out');
    setTimeout(() => {
        notificationEl.style.display = 'none';
        notificationEl.classList.remove('animate-fade-in-out');
    }, 3000);
}

