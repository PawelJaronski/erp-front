import React from 'react';
import { useAccountBalances } from '../hooks/useAccountBalances';

export const AccountBalancesPanel: React.FC = () => {
  const { data, isLoading, error } = useAccountBalances();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-2">
        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></span>
        Loading balances...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 py-2">Error loading balances: {error.message}</div>
    );
  }
  if (!data) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
      <div className="text-gray-700 text-base font-semibold mb-2">Account balances</div>
      <ul className="space-y-1">
        {data.map((acc) => (
          <li key={acc.account} className="flex justify-between items-center">
            <span className="text-gray-700">{acc.account}</span>
            <span className={acc.balance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {acc.balance.toFixed(2)} zł
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}; 