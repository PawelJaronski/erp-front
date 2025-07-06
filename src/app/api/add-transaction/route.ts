// Create POST route proxying add-transaction to FastAPI backend
import { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${API_BASE}/add-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      // Keep origin server-side → no CORS
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