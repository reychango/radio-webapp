export const config = { runtime: 'edge' };

export default async function handler(req) {
    // 7.html es el endpoint clásico de Shoutcast: listeners,connected,max,unique,bitrate,songtitle
    const targetUrl = "http://88.150.230.110:10718/7.html";

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Referer': 'http://uk2freenew.listen2myradio.com/',
                'Origin': 'http://uk2freenew.listen2myradio.com/'
            },
            signal: AbortSignal.timeout(6000)
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Upstream Error", status: response.status }), {
                status: 502,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }

        const html = await response.text();
        // Extraer contenido entre <body> y </body>
        const bodyMatch = html.match(/<body>(.*)<\/body>/i);
        const rawData = bodyMatch ? bodyMatch[1] : html;

        // El formato es: 2,1,282,10000,1,128,Artista - Cancion
        const parts = rawData.split(',');
        const songTitle = parts.length >= 7 ? parts.slice(6).join(',') : "La Espárrago Rock";

        return new Response(JSON.stringify({ songtitle: songTitle }), {
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
