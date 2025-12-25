export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const streamUrl = "http://88.150.230.110:10718/stream";

    try {
        const response = await fetch(streamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'audio/mpeg, */*',
            }
        });

        if (!response.ok) {
            return new Response(`Error: ${response.status}`, {
                status: response.status,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }

        // We stream the body directly from the source to the client
        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive"
            },
        });
    } catch (error) {
        console.error('Edge Stream Proxy Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            },
        });
    }
}
