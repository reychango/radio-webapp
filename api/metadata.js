const http = require('http');

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = "http://88.150.230.110:10718/stats?sid=1&json=1";

    const proxyRequest = http.request(targetUrl, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'http://uk2freenew.listen2myradio.com/',
            'Origin': 'http://uk2freenew.listen2myradio.com/'
        },
        timeout: 8000
    }, (proxyResponse) => {
        let body = '';
        proxyResponse.on('data', hunk => body += hunk);
        proxyResponse.on('end', () => {
            try {
                if (proxyResponse.statusCode === 200) {
                    res.status(200).send(body);
                } else {
                    res.status(502).json({ error: "Upstream Error", status: proxyResponse.statusCode });
                }
            } catch (e) {
                res.status(500).json({ error: "Parse Error" });
            }
        });
    });

    proxyRequest.on('error', (e) => {
        res.status(500).json({ error: 'Connection Failed', message: e.message });
    });

    proxyRequest.on('timeout', () => {
        proxyRequest.destroy();
        res.status(504).json({ error: 'Timeout' });
    });

    proxyRequest.end();
}
