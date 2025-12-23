export default async function handler(req, res) {
    // Add CORS headers so the frontend can call it even from local dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = "http://uk2freenew.listen2myradio.com:10718/stats?sid=1&json=1";

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
            },
            // Short timeout to avoid hanging the lambda
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Radio server returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Metadata proxy error:', error);
        res.status(500).json({
            error: 'Failed to fetch radio metadata',
            message: error.message
        });
    }
}
