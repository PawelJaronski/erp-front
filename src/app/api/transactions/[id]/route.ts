import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

// Correct context type for Next.js 15+
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
    const { id } = context.params;

    if (!id) {
        return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
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
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}