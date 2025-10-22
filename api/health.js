// 🚀 beautycat API 헬스 체크 엔드포인트
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = {
            status: 'OK',
            service: 'beautycat-api',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            message: 'beautycat API 서버가 정상 작동 중입니다!'
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Health check 실패:', error);
        return res.status(503).json({
            status: 'ERROR',
            service: 'beautycat-api',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
}

