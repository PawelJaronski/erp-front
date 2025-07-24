import React from 'react'
import { AccountSelect } from '@/features/transactions/components/AccountSelect'
import { FormField } from '@/shared/components/form/FormField'

interface AccountFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    required?: boolean
    placeholder?: string
    inline?: boolean
    className?: string
}

export function AccountField({
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'Select Account',
    inline = false,
    className = ''
}: AccountFieldProps) {
    if (inline) {
        return (
            
                <AccountSelect
                    value={value}
                    onChange={onChange}
                    error={error}
                    placeholder={placeholder}
                />
                
                
        );
    }

    return (
        <FormField
            label={label}
            error={error}
            required={required}
            className={className}
        >
            <AccountSelect
                value={value}
                onChange={onChange}
                error={error}
                placeholder={placeholder}
            />
        </FormField>
    );
}