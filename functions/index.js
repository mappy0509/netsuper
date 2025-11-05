// Firebase Cloud FunctionsとAdmin SDKのモジュールをインポート
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// StripeのNode.jsライブラリをインポートし、シークレットキーを設定
// 【重要】このシークレットキーは絶対にコードに直接書かず、環境変数に設定してください。
// Firebase CLIで `firebase functions:config:set stripe.secret_key="sk_test_..."` のように設定します。
const stripe = require("stripe")(functions.config().stripe.secret_key);


// --- START: shipping.js のロジックをここに複製 ---
// (Cloud Functions(CommonJS)は shipping.js(ES Module)を直接 import できないため)

// 都道府県と地域のマッピング
const prefecturesByRegion = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州・熊本': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    '沖縄': ['沖縄県']
};

// 地域ごとの送料
const shippingFees = {
    '北海道': 1000,
    '東北': 350,
    '関東': 600,
    '中部': 250,
    '近畿': 250,
    '中国': 200,
    '四国': 200,
    '九州・熊本': 0, // 九州・熊本は無料
    '沖縄': 400
};

/**
 * 都道府県名から送料を計算して返します。
 * @param {string} prefecture - 都道府県名
 * @returns {number | null} - 送料（円）。見つからない場合は null。
 */
function getShippingFee(prefecture) {
    if (!prefecture) {
        return null; // 都道府県が選択されていない場合はnull
    }
    for (const region in prefecturesByRegion) {
        if (prefecturesByRegion[region].includes(prefecture)) {
            return shippingFees[region];
        }
    }
    return null; // 万が一見つからない場合
}
// --- END: shipping.js のロジック ---


/**
 * サーバー側で安全に合計金額を計算する（共通関数）
 * @param {Array} cart - カート配列
 * @param {string} prefecture - 都道府県
 * @returns {Promise<number>} - 最終合計金額（小計 + 送料）
 */
async function calculateTotalAmount(cart, prefecture) {
    // --- 1. 商品小計を安全に計算 ---
    let subtotalAmount = 0; // 小計
    const db = admin.firestore();
    const productsRef = db.collection("products");

    for (const item of cart) {
        if (!item.id || !item.quantity || item.quantity <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'カート内のアイテム情報が無効です。');
        }
        const productDoc = await productsRef.doc(item.id).get();
        if (!productDoc.exists) {
            console.error(`存在しない商品IDです: ${item.id}`);
            throw new functions.https.HttpsError('not-found', `商品(ID: ${item.id})が見つかりません。`);
        }
        const product = productDoc.data();
        if (product && typeof product.price === 'number') {
            subtotalAmount += product.price * item.quantity;
        } else {
            console.error(`商品に価格が設定されていません: ${item.id}`);
            throw new functions.https.HttpsError('internal', `商品(ID: ${item.id})の価格情報が無効です。`);
        }
    }

    if (subtotalAmount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', '合計金額が0円です。');
    }

    // --- 2. 送料を安全に計算 ---
    const shippingFee = getShippingFee(prefecture);
    if (shippingFee === null) {
        console.error(`無効な都道府県が指定されました: ${prefecture}`);
        throw new functions.https.HttpsError('invalid-argument', '無効な配送先のため、送料を計算できません。');
    }

    // --- 3. 最終的なご請求額を計算 ---
    return subtotalAmount + shippingFee;
}


/**
 * 決済処理を「新規作成」するためのCloud Function
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    const { cart, prefecture } = data;

    // バリデーション
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'カート情報が無効です。');
    }
    if (!prefecture) {
        throw new functions.https.HttpsError('invalid-argument', '配送先の都道府県が指定されていません。');
    }

    try {
        // 共通関数で合計金額を計算
        const finalTotalAmount = await calculateTotalAmount(cart, prefecture);

        // StripeでPaymentIntent（支払いインテント）を作成
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalTotalAmount,
            currency: "jpy",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // client_secretをクライアントに返す
        return {
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error) {
        console.error("Stripe PaymentIntentの作成に失敗しました:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError('internal', '決済処理の開始に失敗しました。');
    }
});


/**
 * 決済処理を「更新」するためのCloud Function (★新規追加★)
 */
exports.updatePaymentIntent = functions.https.onCall(async (data, context) => {
    const { cart, prefecture, paymentIntentId } = data;

    // バリデーション
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'カート情報が無効です。');
    }
    if (!prefecture) {
        throw new functions.https.HttpsError('invalid-argument', '配送先の都道府県が指定されていません。');
    }
    if (!paymentIntentId) {
        throw new functions.https.HttpsError('invalid-argument', 'PaymentIntent IDがありません。');
    }

    try {
        // 共通関数で新しい合計金額を計算
        const finalTotalAmount = await calculateTotalAmount(cart, prefecture);
        
        // StripeのPaymentIntentを更新
        await stripe.paymentIntents.update(paymentIntentId, {
            amount: finalTotalAmount,
        });

        // 成功をクライアントに返す (clientSecretは不要)
        return { success: true, newAmount: finalTotalAmount };

    } catch (error) {
        console.error("Stripe PaymentIntentの更新に失敗しました:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        // Stripe APIエラーの場合もキャッチ
        if (error.code) {
             console.error("Stripe APIエラー:", error.message);
             throw new functions.https.HttpsError('internal', `Stripe APIエラー: ${error.message}`);
        }
        throw new functions.https.HttpsError('internal', '決済処理の更新に失敗しました。');
    }
});