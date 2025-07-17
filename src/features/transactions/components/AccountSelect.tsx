import React from 'react';
import { accounts } from '@/features/transactions/utils/staticData';
import { ComboBox } from '@/shared/components/form/ComboBox';

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
}

export function AccountSelect({
  value,
  onChange,
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
    />
  );
} 