import type { TransactionRequest } from '@/shared/contracts/transactions';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jaronski-erp-backend-production.up.railway.app';

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