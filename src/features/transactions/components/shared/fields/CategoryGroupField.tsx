import React from 'react'
import { CategoryGroupSelect } from '@/features/transactions/components/CategoryGroupSelect'
import {FormField} from '@/shared/components/form/FormField'
import {CategoryGroupValue} from '@/features/transactions/utils/staticData'

interface CategoryGroupFieldProps {
    label: string
    value: CategoryGroupValue
    onChange: (value: string) => void
    error?: string
    required?: boolean
    placeholder?: string
    inline?: boolean
    className?: string
}

export function CategoryGroupField({
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'Select Category Group',
    inline = false,
    className = ''
}: CategoryGroupFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <CategoryGroupSelect
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    error={error}
                    onCustomValueChange={() => {}}
                />
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
            <CategoryGroupSelect
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                error={error}
                onCustomValueChange={() => {}}
            />
        </FormField>
    );
}