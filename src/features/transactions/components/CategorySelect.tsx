// frontend/src/features/transactions/components/CategorySelect.tsx
import React from 'react';
import { categoriesData } from '@/features/transactions/utils/staticData';
import { ChevronDown, X } from 'lucide-react';

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

  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Category
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none pr-20 px-4 py-3 cursor-pointer border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">{placeholder}</option>
          {availableCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value}
            </option>
          ))}
          <option value="other">other</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-2 cursor-pointer rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            title="Clear category"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      {value === 'other' && onCustomValueChange && (
        <input
          type="text"
          value={customValue || ''}
          onChange={(e) => onCustomValueChange(e.target.value)}
          placeholder="Enter custom category..."
          className="mt-2 w-full px-4 py-3 cursor-pointer border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};