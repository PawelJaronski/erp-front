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

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    let msg = 'Failed to delete transaction';
    try {
      // Próbujemy odczytać JSON z błędem, jeśli jest
      const errorData = await res.json();
      msg = errorData.error || msg;
    } catch {
      // Jeśli odpowiedź błędu nie jest JSON-em, używamy statusu
      msg = `Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(msg);
  }
  // Dla statusu 204 (sukces) nie ma body, więc nic nie zwracamy
}

export async function deleteTransactions(ids: string[]): Promise<void> {
  // Wykonujemy wszystkie operacje usuwania równolegle
  const deletePromises = ids.map(id => deleteTransaction(id));
  await Promise.all(deletePromises);
}

export interface TransactionUpdateData {
  event_type?: string;
  category_group?: string;
  category?: string;
  account?: string;
  gross_amount?: number;
  net_amount?: number;
  vat_amount?: number;
  business_timestamp?: string;
  business_reference?: string;
}

export async function updateTransaction(id: string, data: TransactionUpdateData): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let msg = 'Failed to update transaction';
    try {
      const errorData = await res.json();
      msg = errorData.error || errorData.detail || msg;
    } catch {
      msg = `Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(msg);
  }
}
