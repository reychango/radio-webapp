export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const streamUrl = "http://uk2freenew.listen2myradio.com:10718/stream";

    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        });
    }

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'audio/mpeg, */*',
                'Icy-MetaData': '0'
            }
        });

        if (!response.ok) {
            return new Response(`Radio Error ${response.status}`, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // Retornamos una respuesta LIMPIA, sin cabeceras basurilla del servidor Shoutcast
        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive",
                "Pragma": "no-cache",
                "X-V17-Version": "Ultimate"
            },
        });
    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
