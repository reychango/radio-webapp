export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = "http://88.150.230.110:10718/stats?sid=1&json=1";

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Referer': 'http://uk2freenew.listen2myradio.com/',
                'Origin': 'http://uk2freenew.listen2myradio.com/'
            },
            signal: AbortSignal.timeout(9000)
        });

        if (!response.ok) {
            return res.status(502).json({ error: "Upstream Error", status: response.status });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            error: 'Connection Failed',
            message: error.message
        });
    }
}
