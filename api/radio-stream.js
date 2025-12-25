export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // Versión V24-BRIDGE: Sin filtros, sin bloqueos, solo tubería pura por IP
    const streamUrl = "http://88.150.230.110:10718/stream";

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'audio/mpeg, */*',
                'Connection': 'keep-alive',
                'Icy-MetaData': '0'
            },
            // Habilitamos duplex para flujos de datos continuos
            duplex: 'half'
        });

        if (!response.ok) {
            return new Response(`Radio Bridge Error: ${response.status}`, {
                status: 502,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }

        // Retornamos el cuerpo exacto del stream sin procesar
        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive",
                "X-V24-Status": "Bridge-Mode"
            },
        });
    } catch (error) {
        return new Response(`Bridge Fault: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
