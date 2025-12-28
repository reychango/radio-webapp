// Cloudflare Worker V3 - Simulando app de Android
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/test') {
            return new Response('La Espárrago Rock - Cloudflare Audio Proxy V3-ANDROID', {
                headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // Stream endpoint
        const radioUrl = 'http://88.150.230.110:10718/;';

        try {
            // Simulamos ser la app de Android de radio
            const response = await fetch(radioUrl, {
                method: 'GET',
                headers: {
                    // User-Agent de app Android de radio
                    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 13; SM-G998B Build/TP1A.220624.014)',
                    'Accept': '*/*',
                    'Accept-Encoding': 'identity',
                    'Connection': 'keep-alive',
                    'Icy-MetaData': '0',
                    // Sin Referer ni Origin - las apps móviles no los envían
                }
            });

            if (!response.ok) {
                return new Response(`Radio: ${response.status}`, {
                    status: response.status,
                    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' }
                });
            }

            return new Response(response.body, {
                status: 200,
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache',
                    'X-Proxy-Version': 'V3-ANDROID'
                }
            });
        } catch (error) {
            return new Response(`Error: ${error.message}`, {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
};
