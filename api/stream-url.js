export const config = { runtime: 'edge' };

export default async function handler(req) {
    // Obtener la página oficial del reproductor para extraer la URL actual del stream
    const playerPageUrl = "https://esparragorock.radio12345.com";

    try {
        const response = await fetch(playerPageUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Could not fetch player page" }), {
                status: 502,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }

        const html = await response.text();

        // Buscar la URL del stream en el HTML (formato: live.mp3?typeportmount=s2_10718_stream_XXXXXXXXX)
        const streamMatch = html.match(/live\.mp3\?typeportmount=s2_10718_stream_\d+/);

        if (streamMatch) {
            const streamPath = streamMatch[0];
            const fullUrl = `https://uk2freenew.listen2myradio.com/${streamPath}`;

            return new Response(JSON.stringify({ streamUrl: fullUrl }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache, max-age=0"
                },
            });
        } else {
            // Fallback: usar la URL directa del servidor (requiere proxy)
            return new Response(JSON.stringify({
                streamUrl: null,
                fallback: "/api/radio-stream",
                message: "Dynamic URL not found, use proxy"
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: "Connection Failed", message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
}
