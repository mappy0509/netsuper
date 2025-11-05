/**
 * 複数のページで共有する関数を定義します。
 */

// 商品リストのデータは Firestore に一元化されたため、ここからは削除されました。


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