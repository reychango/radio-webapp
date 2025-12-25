export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const streamUrl = "http://uk2freenew.listen2myradio.com:10718/;";

    try {
        // Añadimos un timeout corto al fetch para no dejar la función colgada si el servidor no responde
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'WinampMPEG/5.0',
                'Accept': '*/*',
                'Icy-MetaData': '0'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return new Response(`Radio Server Status: ${response.status}`, {
                status: 502,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }

        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive",
                "X-V22-Status": "Safe-Mode"
            },
        });
    } catch (error) {
        const isAbort = error.name === 'AbortError';
        return new Response(isAbort ? 'Radio Server Timeout' : `Proxy Error: ${error.message}`, {
            status: isAbort ? 504 : 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
