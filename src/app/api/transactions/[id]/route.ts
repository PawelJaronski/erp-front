import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

// Na razie tworzymy tylko endpoint DELETE. GET dodamy później, jeśli będzie potrzebny.
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

        // Jeśli backend zwrócił błąd, przekaż go dalej
        if (!res.ok) {
            const errorText = await res.text();
            return new Response(errorText, {
                status: res.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Jeśli sukces, zwróć pustą odpowiedź z kodem 204 (No Content)
        return new Response(null, { status: 204 });

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}