export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const targetUrl = "http://88.150.230.110:10718/;";

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        // Create a new Response with the stream and appropriate headers
        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Edge Stream Proxy Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to proxy stream' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
