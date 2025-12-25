export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // V25-PROTOCOL-BRIDGE: Identidad VLC para máxima compatibilidad Shoutcast
    const streamUrl = "http://88.150.230.110:10718/;";

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Icy-MetaData': '0'
            },
            duplex: 'half'
        });

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
                "X-V25-Status": "VLC-Bridge"
            },
        });
    } catch (error) {
        return new Response(`Bridge Error: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
