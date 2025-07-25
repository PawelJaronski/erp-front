import React from 'react';
import { CategoryGroupSelect } from './CategoryGroupSelect';
import { CategorySelect } from './CategorySelect';
import { CategoryData } from '../utils/staticData';

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
  availableCategories: readonly CategoryData[];
  className?: string;
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
  availableCategories,
  className,
}) => {
  return (
    <>
      <CategoryGroupSelect
        value={categoryGroup}
        onChange={onCategoryGroupChange}
        customValue={customCategoryGroup}
        onCustomValueChange={onCustomCategoryGroupChange}
        error={errors.category_group}
        className={className}
      />
      
      <CategorySelect
        value={category}
        onChange={onCategoryChange}
        customValue={customCategory}
        onCustomValueChange={onCustomCategoryChange}
        error={errors.category}
        availableCategories={availableCategories}
        className={className}
      />
    </>
  );
};