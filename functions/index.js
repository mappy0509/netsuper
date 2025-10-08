// Firebase Cloud FunctionsとAdmin SDKのモジュールをインポート
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// StripeのNode.jsライブラリをインポートし、シークレットキーを設定
// 【重要】このシークレットキーは絶対にコードに直接書かず、環境変数に設定してください。
// Firebase CLIで `firebase functions:config:set stripe.secret_key="sk_test_..."` のように設定します。
const stripe = require("stripe")(functions.config().stripe.secret_key);

// サーバーサイドで管理する商品情報
// 金額の改ざんを防ぐため、フロントエンドから送られてきた金額は信用せず、
// 必ずサーバーサイドの情報を使って合計金額を計算します。
const productsData = {
    'veg-a': { price: 2980 },
    'veg-b': { price: 4980 },
    'rice-30': { price: 11000 },
    'rice-20': { price: 7500 },
    'rice-10': { price: 4000 },
};

/**
 * 決済処理を開始するためのCloud Function
 * @param {object} data - クライアントから送られてくるデータ。{ cart: [...] } を期待。
 * @param {object} context - 認証情報などを含むコンテキスト。
 * @returns {object} - { clientSecret: '...' } を含むオブジェクト。
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    const cart = data.cart;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'カート情報が無効です。');
    }

    try {
        // サーバーサイドで合計金額を安全に計算
        let totalAmount = 0;
        cart.forEach(item => {
            const product = productsData[item.id];
            if (product) {
                totalAmount += product.price * item.quantity;
            }
        });

        if (totalAmount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', '合計金額が0円です。');
        }

        // StripeでPaymentIntent（支払いインテント）を作成
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: "jpy", // 通貨を日本円に設定
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // 作成したPaymentIntentのclient_secretをクライアントに返す
        return {
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error) {
        console.error("Stripe PaymentIntentの作成に失敗しました:", error);
        throw new functions.https.HttpsError('internal', '決済処理の開始に失敗しました。');
    }
});

