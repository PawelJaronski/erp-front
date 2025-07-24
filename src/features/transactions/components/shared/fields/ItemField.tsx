import React from 'react'
import { FormField } from '@/shared/components/form/FormField'

interface ItemFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    required?: boolean
    inline?: boolean
    className?: string
}

export function ItemField({
    label,
    value,
    onChange,
    placeholder = 'Item (optional)',
    error,
    required = false,
    inline = false,
    className = ''
}: ItemFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
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
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
            />
        </FormField>
    );
}