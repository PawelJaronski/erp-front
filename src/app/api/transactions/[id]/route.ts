import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
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
        // Zwracamy odpowiedź w formacie, którego oczekuje Next.js
        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
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
        // Zwracamy odpowiedź w formacie, którego oczekuje Next.js
        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}