import React from 'react';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { FormField } from '@/shared/components/form/FormField';

interface AmountFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    required?: boolean
    placeholder?: string
    className?: string
    inline?: boolean
}

export function AmountField({
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'Enter Amount',
    className = '',
    inline = false
}: AmountFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <AmountInput
                    value={value}
                    onChange={onChange}
                    error={error}
                    placeholder={placeholder}
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
            <AmountInput
                value={value}
                onChange={onChange}
                error={error}
                placeholder={placeholder}
            />
        </FormField>
    );
}