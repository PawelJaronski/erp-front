import React from 'react';
import { accounts } from '@/features/transactions/utils/staticData';
import { ComboBox } from '@/shared/components/form/ComboBox';

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  isClearable?: boolean;
}

export function AccountSelect({
  value,
  onChange,
  error,
  placeholder = 'Select account...',
  isClearable = true
}: AccountSelectProps) {
  return (
    <ComboBox
      value={value}
      onChange={onChange}
      options={accounts}
      placeholder={placeholder}
      isClearable={isClearable}
      error={error}
    />
  );
} 