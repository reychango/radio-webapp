export const config = { runtime: 'edge' };

export default async function handler(req) {
    const targetUrl = "http://88.150.230.110:10718/stats?sid=1&json=1";

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'http://uk2freenew.listen2myradio.com/',
                'Origin': 'http://uk2freenew.listen2myradio.com/'
            },
            // Short timeout for metadata
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Upstream Error", status: response.status }), {
                status: 502,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }

        const data = await response.text();
        return new Response(data, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Connection Failed", message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
}
