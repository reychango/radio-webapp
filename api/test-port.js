export const config = { runtime: 'edge' };

export default async function handler(req) {
    try {
        const res = await fetch("https://www.google.com");
        return new Response(JSON.stringify({ success: true, status: res.status }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
