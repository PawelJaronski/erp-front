import React from 'react';
import { AccountSelect, CategoryGroupSelect, CategorySelect } from '@/features/transactions/components';
import { DateInput } from '@/shared/components/form/DateInput';

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

interface EditableSelectCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  type: 'account' | 'category_group' | 'category';
  availableCategories?: any[];
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

  const selectProps = {
    value,
    onChange,
    className: error ? 'border-red-500' : '',
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    styles: {
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      control: (base: any) => ({
        ...base,
        minHeight: '32px',
        height: '32px',
        fontSize: '14px'
      })
    }
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