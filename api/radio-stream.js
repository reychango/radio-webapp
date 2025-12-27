const http = require('http');

export default function handler(req, res) {
    // V29-SERVERLESS-RESCUE: Usando el stack de Node.js puro (no Edge)
    const streamUrl = "http://88.150.230.110:10718/;"; // Formato clásico Shoutcast

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Connection', 'keep-alive');

    const proxyRequest = http.request(streamUrl, {
        method: 'GET',
        headers: {
            'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
            'Accept': '*/*',
            'Icy-MetaData': '0',
            'Referer': 'http://uk2freenew.listen2myradio.com/',
            'Origin': 'http://uk2freenew.listen2myradio.com/'
        }
    }, (proxyResponse) => {
        // Enviar cabeceras de éxito
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Transfer-Encoding': 'chunked'
        });

        // Pipe directo de la respuesta
        proxyResponse.pipe(res);
    });

    proxyRequest.on('error', (e) => {
        console.error("V29 Proxy Error:", e.message);
        if (!res.headersSent) {
            res.status(500).send("Bridge Fault: " + e.message);
        }
    });

    // Handle client disconnect
    req.on('close', () => {
        proxyRequest.destroy();
    });

    proxyRequest.end();
}
