import React from 'react'
import { VATSection } from '@/features/transactions/components/VATSection'
import { FormField } from '@/shared/components/form/FormField'

interface VatFieldProps {
    label: string
    includeTax: boolean
    taxRate: number
    onIncludeTaxChange: (value: boolean) => void
    onTaxRateChange: (value: number) => void
    error?: string
    required?: boolean
    inline?: boolean
    className?: string
}

export function VatField({
    label,
    includeTax,
    taxRate,
    onIncludeTaxChange,
    onTaxRateChange,
    error,
    required = false,
    inline = false,
    className = ''
}: VatFieldProps) {
    if (inline) {
        return (
            <div className={className}>
                <VATSection
                    includeTax={includeTax}
                    taxRate={taxRate}
                    onIncludeTaxChange={onIncludeTaxChange}
                    onTaxRateChange={onTaxRateChange}
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
            <VATSection
                includeTax={includeTax}
                taxRate={taxRate}
                onIncludeTaxChange={onIncludeTaxChange}
                onTaxRateChange={onTaxRateChange}
            />
        </FormField>
    );
}