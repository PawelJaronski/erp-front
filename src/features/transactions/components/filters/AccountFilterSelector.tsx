'use client';

import React from 'react';
import { AccountSelect } from '@/features/transactions/components/AccountSelect';

interface AccountFilterSelectorProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    onSyncWithForm: () => void;
}

export function AccountFilterSelector({ value, onChange, onSyncWithForm }: AccountFilterSelectorProps) {
    const handleChange = (selectedValue: string) => {
        onChange(selectedValue === '' ? undefined : selectedValue);
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account:</label>
            </div>
            <AccountSelect
                value={value || ''}
                onChange={handleChange}
                placeholder="All accounts"
                isClearable={true}
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
        