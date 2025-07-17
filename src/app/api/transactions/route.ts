// Create GET route proxying transactions to FastAPI backend

import { NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const queryString = searchParams.toString()

        const url = queryString
            ? `${API_BASE}/transactions?${queryString}`
            : `${API_BASE}/transactions`

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const text = await res.text()

        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error'
        return new Response(JSON.stringify({ error: msg }), { status: 500 })
    }
}