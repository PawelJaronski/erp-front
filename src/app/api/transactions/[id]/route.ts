import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

// WZORZEC SKLONOWANY Z `add-transaction` I ZASTOSOWANY TUTAJ:
// 1. Używamy `NextRequest` z importu, a nie globalnego `Request`.
// 2. Używamy `context` jako drugiego argumentu - to jest jedyna, konieczna różnica.
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    // Pobieramy `id` z `context`, bo to trasa dynamiczna
    const { id } = context.params;
    
    if (!id) {
        return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
    }

    const url = `${API_BASE}/transactions/${id}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                // Skopiowane z działającego pliku dla spójności
                'Content-Type': 'application/json',
            },
        });

        // Skopiowane z działającego pliku dla spójności
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