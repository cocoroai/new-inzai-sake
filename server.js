const http = require('http');
const fs = require('fs');
const path = require('path');

// .env.localから環境変数を読み込み
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const PORT = 4000;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
    // APIリクエストの処理
    if (req.url.startsWith('/api/news')) {
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const limit = urlParams.searchParams.get('limit') || 5;

        try {
            const response = await fetch(
                `https://inzaisake.microcms.io/api/v1/news?limit=${limit}`,
                {
                    headers: {
                        'X-MICROCMS-API-KEY': MICROCMS_API_KEY
                    }
                }
            );

            const data = await response.json();

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch news' }));
        }
        return;
    }

    // 静的ファイルの処理
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
