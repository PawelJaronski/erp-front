import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
    }

    const url = `${API_BASE}/transactions/${id}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            const errorText = await res.text();
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json({ error: errorJson.message || 'Backend error' }, { status: res.status });
            } catch {
                return NextResponse.json({ error: errorText }, { status: res.status });
            }
        }
        
        return new Response(null, { status: 204 });

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected network or server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}