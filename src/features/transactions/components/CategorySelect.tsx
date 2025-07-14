import React from 'react';
import { categoriesData, CategoryData } from '@/features/transactions/utils/staticData';
import { ComboBox } from '@/shared/components/form/ComboBox';

interface Props {
  value: string;
  onChange: (value: string) => void;  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  availableCategories: readonly CategoryData[];
}

export const CategorySelect: React.FC<Props> = ({
  value,
  onChange,
  customValue,
  onCustomValueChange,
  error,
  placeholder = 'Select category...',
  availableCategories,
}) => {

  const options = [
    ...(availableCategories || categoriesData).map(c => ({ value: c.value, label: c.value })),
    { value: 'other', label: 'other' }
  ];

  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Category
      </label>
      <ComboBox
        value={value}
        onChange={onChange}
        options={options}
        error={error}
        placeholder={placeholder}
      />
      {value === 'other' && onCustomValueChange && (
        <input
          type="text"
          value={customValue || ''}
          onChange={(e) => onCustomValueChange(e.target.value)}
          placeholder="Enter custom category..."
          className="mt-2 w-full px-4 py-3 cursor-pointer border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
};