import { useQuery } from '@tanstack/react-query';
import { TransactionFilters } from '@/features/transactions/types';

export interface TransactionsSum {
  gross_amount_sum: number | null;
  net_amount_sum: number | null;
  vat_amount_sum: number | null;
}

async function fetchTransactionsSum(filters: TransactionFilters): Promise<TransactionsSum> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const url = `/api/transactions-sum?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions sum: ${response.statusText}`);
  }
  const data = await response.json();
  // API returns array of one object
  return data[0] || { gross_amount_sum: 0, net_amount_sum: 0, vat_amount_sum: 0 };
}

export function useTransactionsSum(filters: TransactionFilters) {
  return useQuery<TransactionsSum>({
    queryKey: [
      'transactions-sum',
      filters.account,
      filters.category_group,
      filters.category,
      filters.search,
      filters.date_from,
      filters.date_to,
      filters.date_preset,
      filters.amount_type,
    ],
    queryFn: () => fetchTransactionsSum(filters),
  });
} 