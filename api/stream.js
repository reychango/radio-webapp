const http = require('http');

export default function handler(req, res) {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const streamUrl = "http://uk2freenew.listen2myradio.com:10718/stream";

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'audio/mpeg, */*',
            'Icy-MetaData': '0'
        },
        timeout: 10000
    };

    http.get(streamUrl, options, (streamRes) => {
        // Forzamos el Content-Type correcto para que el navegador lo identifique como MP3
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Connection', 'keep-alive');

        // Hacemos el pipe directo del chorro de audio al navegador
        streamRes.pipe(res);

        streamRes.on('error', (err) => {
            console.error('Radio Stream Error:', err);
            res.end();
        });
    }).on('error', (err) => {
        console.error('Radio Request Error:', err);
        res.status(500).send(`Radio connection failed: ${err.message}`);
    });
}
