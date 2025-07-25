import React from 'react';
import { AccountSelect, CategoryGroupSelect, CategorySelect } from '@/features/transactions/components';
import { DateInput } from '@/shared/components/form/DateInput';
import { StylesConfig, GroupBase } from 'react-select';
import { CategoryData } from '@/features/transactions/utils/staticData';

interface EditableTextCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  error?: boolean;
  type?: 'text' | 'number';
  className?: string;
}

export function EditableTextCell({ 
  value, 
  onChange, 
  onKeyDown, 
  error, 
  type = 'text',
  className = '' 
}: EditableTextCellProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={`w-full px-2 py-1 border rounded ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } focus:outline-none focus:border-blue-500 ${className}`}
      autoFocus={type === 'text'}
    />
  );
}

interface Option {
  value: string;
  label: string;
}

interface EditableSelectCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  type: 'account' | 'category_group' | 'category';
  availableCategories?: readonly CategoryData[];
  error?: boolean;
}

export function EditableSelectCell({ 
  value, 
  onChange, 
  onKeyDown, 
  type, 
  availableCategories,
  error 
}: EditableSelectCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let react-select handle its own keyboard navigation
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Escape') {
      onKeyDown(e);
    }
  };

  // Define proper styles for react-select
  const selectStyles: StylesConfig<Option, false, GroupBase<Option>> = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
      minHeight: '32px',
      height: '32px',
      fontSize: '14px',
      borderColor: error ? '#ef4444' : base.borderColor,
      backgroundColor: error ? '#fef2f2' : base.backgroundColor,
    })
  };

  const selectProps = {
    value,
    onChange,
    className: error ? 'border-red-500' : '',
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    styles: selectStyles
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {type === 'account' && (
        <AccountSelect {...selectProps} />
      )}
      {type === 'category_group' && (
        <CategoryGroupSelect 
          {...selectProps} 
          onCustomValueChange={() => {}} 
        />
      )}
      {type === 'category' && (
        <CategorySelect 
          {...selectProps} 
          availableCategories={availableCategories || []} 
          onCustomValueChange={() => {}} 
        />
      )}
    </div>
  );
}

interface EditableDateCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  error?: boolean;
}

export function EditableDateCell({ value, onChange, onKeyDown, error }: EditableDateCellProps) {
  return (
    <DateInput
      value={value}
      onChange={onChange}
      className={`${error ? 'border-red-500 bg-red-50' : ''}`}
    />
  );
}