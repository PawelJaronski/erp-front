import React from 'react';
import { categoriesData, categoryGroups } from '@/features/transactions/utils/staticData';

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
            className={`w-full appearance-none pr-4 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
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
        </div>
        {categoryGroup === 'other' && (
          <input
            type="text"
            value={customCategoryGroup}
            onChange={(e) => onCustomCategoryGroupChange(e.target.value)}
            placeholder="Enter custom category group..."
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
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
            className={`w-full appearance-none pr-4 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
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
        </div>
        {category === 'other' && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => onCustomCategoryChange(e.target.value)}
            placeholder="Enter custom category..."
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    </>
  );
}; 