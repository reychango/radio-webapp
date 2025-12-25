export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // Nueva ruta y técnica TRINITY para V20
    const streamUrl = "http://uk2freenew.listen2myradio.com:10718/;";

    try {
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'WinampMPEG/5.0',
                'Accept': '*/*',
                'Icy-MetaData': '0'
            }
        });

        if (!response.ok) {
            return new Response(`Radio Server Error: ${response.status}`, {
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
                "X-V20-Status": "Trinity-Flow"
            },
        });
    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    }
}
