export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // El punto y coma (;) es el truco de Shoutcast para servir un chorro MP3 directo
    const streamUrl = "http://88.150.230.110:10718/;";

    try {
        const response = await fetch(streamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'audio/mpeg, */*',
                'Icy-MetaData': '0'
            }
        });

        // Forzamos las cabeceras para que Firefox lo reconozca como audio real
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
        return new Response(`Proxy Error: ${error.message}`, {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "text/plain"
            },
        });
    }
}
