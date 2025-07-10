import React from 'react';
import { FormField } from '@/shared/components/form';

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export const TransactionItem: React.FC<Props> = ({ 
    value,
    onChange,
    placeholder = 'Item (optional)',
    label = 'Item',
}) => (
    <FormField label={label}>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
        />
    </FormField>
);