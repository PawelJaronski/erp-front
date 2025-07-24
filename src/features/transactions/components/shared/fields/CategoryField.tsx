import React from 'react'
import { CategorySelect } from '@/features/transactions/components/CategorySelect'
import { FormField } from '@/shared/components/form/FormField'
import { CategoryData } from '@/features/transactions/utils/staticData'

interface CategoryFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    availableCategories: readonly CategoryData[]
    error?: string
    required?: boolean
    placeholder?: string
    inline?: boolean
    className?: string
}

export function CategoryField({
    label,
    value,
    onChange,
    availableCategories,
    error,
    required = false,
    placeholder = 'Select Category',
    inline = false,
    className = ''
}: CategoryFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <CategorySelect
                    value={value}
                    onChange={onChange}
                    availableCategories={availableCategories}
                    placeholder={placeholder}
                    error={error}
                    onCustomValueChange={() => {}}
                />
                {error && (
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                )}
            </div>
        );
    }

    return (
        <FormField
            label={label}
            error={error}
            required={required}
            className={className}
        >
            <CategorySelect
                value={value}
                onChange={onChange}
                availableCategories={availableCategories}
                placeholder={placeholder}
                error={error}
                onCustomValueChange={() => {}}
            />
        </FormField>
    );
}