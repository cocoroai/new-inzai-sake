export default async function handler(req, res) {
    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONSリクエスト（プリフライト）への対応
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GETメソッドのみ許可
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const serviceId = 'inzaisake';
    const endpoint = 'topics';
    const apiKey = process.env.MICROCMS_API_KEY;

    if (!apiKey) {
        console.error('MICROCMS_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const limit = req.query.limit || 5;
    const url = `https://${serviceId}.microcms.io/api/v1/${endpoint}?limit=${limit}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-MICROCMS-API-KEY': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`microCMS API error: ${response.status}`);
        }

        const data = await response.json();

        // キャッシュヘッダーを設定（5分間キャッシュ）
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching from microCMS:', error);
        return res.status(500).json({ error: 'Failed to fetch topics' });
    }
}
