import React from 'react';
import { categoriesData } from '@/features/transactions/utils/staticData';
import { ComboBox } from '@/shared/components/form/ComboBox';

interface Props {
  value: string;
  onChange: (value: string) => void;
  categoryGroup?: string; // dla filtrowania
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const CategorySelect: React.FC<Props> = ({
  value,
  onChange,
  categoryGroup,
  customValue,
  onCustomValueChange,
  error,
  placeholder = 'Select category...'
}) => {
  const availableCategories = React.useMemo(() => {
    if (!categoryGroup || categoryGroup === 'other') return categoriesData;
    return categoriesData.filter((c) => c.group === categoryGroup);
  }, [categoryGroup]);

  const options = [
    ...availableCategories.map(c => ({ value: c.value, label: c.value })),
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