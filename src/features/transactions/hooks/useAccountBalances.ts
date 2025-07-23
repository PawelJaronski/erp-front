import { useQuery } from '@tanstack/react-query';

export interface AccountBalance {
  account: string;
  balance: number;
}

async function fetchAccountBalances(): Promise<AccountBalance[]> {
  const response = await fetch('/api/account-balances', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch account balances: ${response.statusText}`);
  }
  const data = await response.json();
  return data as AccountBalance[];
}

export function useAccountBalances() {
  return useQuery<AccountBalance[]>({
    queryKey: ['account-balances'],
    queryFn: fetchAccountBalances,
  });
} 