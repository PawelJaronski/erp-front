'use client';

import React from 'react'
import { ComboBox } from '@/shared/components/form/ComboBox'
import { categoryGroups } from '@/features/transactions/utils/staticData'

interface CategoryGroupFilterSelectorProps {
    value: string | undefined
    onChange: (value: string | undefined) => void
}

export function CategoryGroupFilterSelector({ 
    value,
    onChange,
}: CategoryGroupFilterSelectorProps) {
    const options = React.useMemo(
  () =>
    categoryGroups
      .filter((g) => g.value !== 'other')
      .map((g) => ({ value: g.value, label: g.label })),
  [],
);

    const handleChange = (selected: string) => {
        onChange(selected === '' ? undefined : selected);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Category group:
            </label>
            <ComboBox
                value={value || ''}
                onChange={handleChange}
                options={options}
                placeholder="All groups"
                isClearable={true}
            />
        </div>
    );
}