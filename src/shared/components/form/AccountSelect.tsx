import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { accounts } from '@/features/transactions/utils/staticData';

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function AccountSelect({
  value,
  onChange,
  error,
  placeholder = 'Select account...'
}: AccountSelectProps) {
  const resetField = () => onChange('');

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none pr-20 px-4 py-3 cursor-pointer border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {accounts.map((account) => (
          <option key={account.value} value={account.value}>
            {account.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      {value && (
        <button
          type="button"
          onClick={resetField}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-2 cursor-pointer rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          title="Clear account"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
} 