'use client'

import React from 'react'
import { ComboBox } from '@/shared/components/form/ComboBox'

interface AccountSelectorProps {
    value: string | undefined
    onChange: (account: string | undefined) => void
    onSyncWithForm: () => void
}

const ACCOUNT_OPTIONS = [
    { value: '', label: 'All accounts' },
    { value: 'mbank_firmowe', label: 'mBank Firmowe' },
    { value: 'mbank_osobiste', label: 'mBank Osobiste' },
    { value: 'paynow', label: 'Paynow' },
    { value: 'cash', label: 'Cash' },
    { value: 'mbank_vat_account', label: 'VAT Account' },
] as const

export function AccountSelector({ value, onChange, onSyncWithForm }: AccountSelectorProps) {
    const handleChange = (selectedValue: string) => {
        onChange(selectedValue === '' ? undefined : selectedValue)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account:</label>
            </div>
            <ComboBox
                value={value || ''}
                onChange={handleChange}
                options={ACCOUNT_OPTIONS}
                placeholder="All accounts"
                isClearable={false}
            />
            <button
                onClick={onSyncWithForm}
                className="mt-6 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
            >
                Sync with form
            </button>
        </div>
    )
}