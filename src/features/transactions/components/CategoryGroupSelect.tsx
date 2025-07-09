import React from 'react';
import { categoryGroups } from '@/features/transactions/utils/staticData';
import { ComboBox } from '@/shared/components/form/ComboBox';

interface Props {
    value: string;
    onChange: (value: string) => void;
    customValue?: string;
    onCustomValueChange: (value: string) => void;
    error?: string;
    placeholder?: string
}

export const CategoryGroupSelect: React.FC<Props> = ({
    value,
    onChange,
    customValue,
    onCustomValueChange,
    error,
    placeholder = 'Select category group'
}) => {
    return (
        <div className="flex-1">
            <label className="block text-sm semibold text-gray-700 mb-2">
                Category Group
            </label>
            <ComboBox
                value={value}
                onChange={onChange}
                options={categoryGroups}
                error={error}
                placeholder={placeholder}
            />
            {value === 'other' && (
                <input
                    type="text"
                    value={customValue || ''}
                    onChange={(e) => onCustomValueChange(e.target.value)}
                    className="mt-2 w-full px-4 py-3 cursor-pointer border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                    placeholder="Enter custom category group..."
                />
            )}
        </div>
    );
};
