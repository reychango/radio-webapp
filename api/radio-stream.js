export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const streamUrl = "http://88.150.230.110:10718/stream";

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Icy-MetaData': '0',
                'Referer': 'http://uk2freenew.listen2myradio.com/',
                'Origin': 'http://uk2freenew.listen2myradio.com/'
            },
            duplex: 'half'
        });

        if (!response.ok) {
            return new Response(`Bridge Blocked: ${response.status}`, {
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
                "X-V28-Status": "Stealth-Mode"
            },
        });
    } catch (error) {
        return new Response(`Network Fault: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
