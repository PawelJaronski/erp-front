import React from 'react';
import { categoriesData, categoryGroups } from '@/features/transactions/utils/staticData';
import { ChevronDown, X } from 'lucide-react';

interface Props {
  categoryGroup: string;
  category: string;
  customCategoryGroup?: string;
  customCategory?: string;
  onCategoryGroupChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCustomCategoryGroupChange: (value: string) => void;
  onCustomCategoryChange: (value: string) => void;
  errors: Record<string, string>;
}

export const CategoryField: React.FC<Props> = ({
  categoryGroup,
  category,
  customCategoryGroup,
  customCategory,
  onCategoryGroupChange,
  onCategoryChange,
  onCustomCategoryGroupChange,
  onCustomCategoryChange,
  errors,
}) => {
  const availableCategories = React.useMemo(() => {
    if (!categoryGroup || categoryGroup === 'other') return categoriesData;
    return categoriesData.filter((c) => c.group === categoryGroup);
  }, [categoryGroup]);

  return (
    <>
      {/* Category Group */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category Group
        </label>
        <div className="relative">
          <select
            value={categoryGroup}
            onChange={(e) => onCategoryGroupChange(e.target.value)}
            className={`w-full appearance-none pr-20 px-4 py-3 cursor-pointer border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
              errors.category_group ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">All groups</option>
            {categoryGroups.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
            <option value="other">other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          {categoryGroup && (
            <button
              type="button"
              onClick={() => onCategoryGroupChange("")}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-2 cursor-pointer rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              title="Clear category group"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {categoryGroup === 'other' && (
          <input
            type="text"
            value={customCategoryGroup}
            onChange={(e) => onCustomCategoryGroupChange(e.target.value)}
            placeholder="Enter custom category group..."
            className="mt-2 w-full px-4 py-3 cursor-pointer border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        )}
        {errors.category_group && (
          <p className="mt-1 text-sm text-red-600">{errors.category_group}</p>
        )}
      </div>

      {/* Category */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`w-full appearance-none pr-20 px-4 py-3 cursor-pointer border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
              errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select category...</option>
            {availableCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value}
              </option>
            ))}
            <option value="other">other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          {category && (
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-2 cursor-pointer rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              title="Clear category"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {category === 'other' && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => onCustomCategoryChange(e.target.value)}
            placeholder="Enter custom category..."
            className="mt-2 w-full px-4 py-3 cursor-pointer border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    </>
  );
}; 