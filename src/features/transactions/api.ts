import type { TransactionRequest } from '@/features/transactions/types';
import { TransactionFilters, TransactionListResponse } from '@/features/transactions/types';

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

export async function fetchTransactions(filters: TransactionFilters): Promise<TransactionListResponse> {
  const params = new URLSearchParams()

  // Zapobiegaj wysyłaniu sprzecznych filtrów
  let effectiveFilters: TransactionFilters = { ...filters };
  if (filters.date_from && filters.date_to) {
    effectiveFilters = { ...filters, date_preset: undefined };
  } else if (filters.date_preset) {
    effectiveFilters = { ...filters, date_from: undefined, date_to: undefined };
  }

  Object.entries(effectiveFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })

  const url = `${API_BASE}/transactions?${params.toString()}`;
  console.log('FETCH TRANSACTIONS URL:', url);
  console.log('FILTERS:', JSON.stringify(effectiveFilters, null, 2));
  console.log('date_from:', effectiveFilters.date_from, 'date_to:', effectiveFilters.date_to, 'date_preset:', effectiveFilters.date_preset);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`)
  }

  return response.json()
}
