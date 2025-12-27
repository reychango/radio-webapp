export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // V27-BATTLE-READY: Simplicidad total para evitar 502/504
    const streamUrl = "http://88.150.230.110:10718/stream";

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Icy-MetaData': '0'
            },
            // Duplex es necesario para flujos largos
            duplex: 'half'
        });

        if (!response.ok) {
            return new Response(`Radio Bridge Error: ${response.status}`, {
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
                "X-V27-Status": "Battle-Ready"
            },
        });
    } catch (error) {
        return new Response(`Bridge Fault: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
