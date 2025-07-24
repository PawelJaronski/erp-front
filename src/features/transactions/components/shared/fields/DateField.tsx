import React from 'react'
import {DateInput} from '@/shared/components/form/DateInput'
import {FormField} from '@/shared/components/form/FormField'

interface DateFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    required?: boolean
    placeholder?: string
    inline?: boolean
    className?: string
}

export function DateField({
    label, 
    value, 
    onChange, 
    error, 
    required = false, 
    placeholder = 'Select Date', 
    inline = false, 
    className = ''
}: DateFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <DateInput
                    value={value}
                    onChange={onChange}
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
            <DateInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </FormField>
    );
}