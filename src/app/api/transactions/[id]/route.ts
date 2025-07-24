// No specific imports are needed; the global Request type is sufficient for Next.js route handlers

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing transaction id' }), { status: 400 });
    }
    const url = `${API_BASE}/transactions/${id}`;
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const text = await res.text();
        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing transaction id' }), { status: 400 });
    }
    const url = `${API_BASE}/transactions/${id}`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const text = await res.text();
        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
} 