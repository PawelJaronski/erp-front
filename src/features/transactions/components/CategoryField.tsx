// frontend/src/features/transactions/components/CategoryField.tsx
import React from 'react';
import { CategoryGroupSelect } from './CategoryGroupSelect';
import { CategorySelect } from './CategorySelect';

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
  return (
    <>
      <CategoryGroupSelect
        value={categoryGroup}
        onChange={onCategoryGroupChange}
        customValue={customCategoryGroup}
        onCustomValueChange={onCustomCategoryGroupChange}
        error={errors.category_group}
      />
      
      <CategorySelect
        value={category}
        onChange={onCategoryChange}
        categoryGroup={categoryGroup}
        customValue={customCategory}
        onCustomValueChange={onCustomCategoryChange}
        error={errors.category}
      />
    </>
  );
};