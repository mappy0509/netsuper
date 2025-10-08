/**
 * 送料に関連するデータとロジック
 */

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
 * @returns {number} - 送料（円）
 */
export function getShippingFee(prefecture) {
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

/**
 * 都道府県のリストを返します。
 * @returns {string[]}
 */
export function getPrefectureList() {
    return Object.values(prefecturesByRegion).flat();
}