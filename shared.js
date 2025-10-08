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
        id: 'rice-30kg-1bag',
        name: '熊本県産 森のくまさん 30kg x 1袋',
        price: 22000,
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米+30kgx1',
        description: 'もちもちとした食感と甘みが特徴。冷めても美味しいお米です。ご家庭での消費量が多い方向けのお得な大袋です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
    },
    {
        id: 'rice-10kg-3bags',
        name: '熊本県産 森のくまさん 10kg x 3袋セット',
        price: 22000,
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米+10kgx3',
        description: 'もちもちとした食感と甘みが特徴。10kgずつ小分けになっているため、保存しやすくおすそ分けにも便利です。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
    },
    {
        id: 'rice-5kg-6bags',
        name: '熊本県産 森のくまさん 5kg x 6袋セット',
        price: 22000,
        imageUrl: 'https://placehold.co/300x300/fef08a/854d0e?text=お米+5kgx6',
        description: 'もちもちとした食感と甘みが特徴。5kgの使い切りサイズが6袋。いつでも開けたての美味しさを楽しめます。',
        isReservation: true,
        reservationNote: '11月下旬から順次発送',
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