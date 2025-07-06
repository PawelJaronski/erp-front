import type { TransactionRequest } from '@/shared/contracts/transactions';

// In browser we hit our own Next.js proxy to avoid CORS; on server we can call backend directly
const API_BASE = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app')
  : '/api';

export async function addTransaction(data: TransactionRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/add-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let msg = 'Unknown error';
    try {
      msg = await res.text();
    } catch {}
    throw new Error(`Backend error ${res.status}: ${msg}`);
  }
} 