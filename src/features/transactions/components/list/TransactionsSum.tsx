import React from 'react';
import { TransactionFilters } from '@/features/transactions/types';
import { useTransactionsSum } from '@/features/transactions/hooks/useTransactionsSum';

interface TransactionsSumProps {
  filters: TransactionFilters;
}

export const TransactionsSum: React.FC<TransactionsSumProps> = ({ filters }) => {
  const { data, isLoading, error } = useTransactionsSum(filters);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-2">
        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></span>
        Loading sum...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 py-2">Error loading sum: {error.message}</div>
    );
  }
  if (!data) return null;

  const sum = Number(data.gross_amount_sum || 0);
  const sumColor = sum >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex flex-wrap gap-6 items-center bg-gray-50 border border-gray-200 rounded-lg px-6 py-3 my-2">
      <div className="text-base font-semibold">
        Total: <span className={sumColor}>{sum.toFixed(2)} zł</span>
      </div>
    </div>
  );
}; 