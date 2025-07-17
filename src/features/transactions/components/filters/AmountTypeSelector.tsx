'use client'

import React from 'react'
import { ComboBox } from '@/shared/components/form/ComboBox'

interface AmountTypeSelectorProps {
    value: string | undefined
    onChange: (value: string | undefined) => void
}

const AMOUNT_TYPE_OPTIONS = [
    { value: '', label: 'All types' },
    { value: 'positive', label: 'Income' },
    { value: 'negative', label: 'Expense' },
] as const

export function AmountTypeSelector({ value, onChange }: AmountTypeSelectorProps) {
    const handleChange = (selectedValue: string) => {
        onChange(selectedValue === '' ? undefined : selectedValue)
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
            <ComboBox
                value={value || ''}
                onChange={handleChange}
                options={AMOUNT_TYPE_OPTIONS}
                placeholder="All types"
                isClearable={false}
            />
        </div>
    )
}