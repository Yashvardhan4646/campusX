export async function POST(request) {
    try {
        const report = await request.json();
        console.log("CSP Violation:", report);
        return new Response(JSON.stringify({ success: true }), {
            status: 204,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid report" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}
