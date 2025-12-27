export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const streamUrl = "http://88.150.230.110:10718/stream";

    // TransformStream actúa como un puente infinito
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Función asíncrona que mantiene la conexión con la radio siempre viva
    const startPumping = async () => {
        while (true) {
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
                    throw new Error(`Radio server status: ${response.status}`);
                }

                const reader = response.body.getReader();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    await writer.write(value);
                }

                console.log("⚠️ Conexión interna cerrada, re-conectando...");
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error("❌ Fallo en puente V26:", error.message);
                // Esperamos un poco antes de re-intentar para no saturar
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    };

    // Iniciamos la tubería pero NO esperamos a que termine (es infinita)
    startPumping();

    return new Response(readable, {
        status: 200,
        headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
            "X-V26-Status": "Regenerator-Mode"
        },
    });
}
