'use client'

import React from 'react'
import { ComboBox } from '@/shared/components/form/ComboBox'

interface DatePresetSelectorProps {
    value: string | undefined
    onChange: (value: string | undefined) => void
}

const DATE_PRESET_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'month_to_date', label: 'Month to Date' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'year_to_date', label: 'Year to Date' },
] as const

export function DatePresetSelector({ value, onChange }: DatePresetSelectorProps) {
    const handleChange = (selectedValue: string) => {
        onChange(selectedValue || undefined)
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
            <ComboBox
                value={value || 'month_to_date'}
                onChange={handleChange}
                options={DATE_PRESET_OPTIONS}
                placeholder="Select date range"
                isClearable={false}
            />
        </div>
    )
}