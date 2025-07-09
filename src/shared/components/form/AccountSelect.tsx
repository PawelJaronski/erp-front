import React from 'react';
import { accounts } from '@/features/transactions/utils/staticData';
import { ComboBox } from './ComboBox';

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
  return (
    <ComboBox
      value={value}
      onChange={onChange}
      options={accounts}
      error={error}
      placeholder={placeholder}
    />
  );
} 