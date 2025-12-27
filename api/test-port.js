export const config = { runtime: 'edge' };

export default async function handler(req) {
    const testUrl = "http://88.150.230.110:10718/stats?sid=1&json=1";
    try {
        const res = await fetch(testUrl);
        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
