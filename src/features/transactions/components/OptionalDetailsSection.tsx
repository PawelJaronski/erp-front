import React from 'react';
import { FormField } from '@/shared/components/form';

interface Props {
  item: string;
  note: string;
  onItemChange: (value: string) => void;
  onNoteChange: (value: string) => void;
}

/**
 * Optional common fields shared by all transaction forms.
 * – business_reference: external reference (e.g. invoice or bank transfer ID)
 * – item: short description of the goods/service
 * – note: internal free-form note
 */
export const OptionalDetailsSection: React.FC<Props> = ({
  item,
  note,
  onItemChange,
  onNoteChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField label="Item / Description">
      <input
        type="text"
        value={item}
        onChange={(e) => onItemChange(e.target.value)}
        placeholder="Short item description (optional)"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
      />
    </FormField>

    <FormField label="Note">
      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Internal note (optional)"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
      />
    </FormField>
  </div>
); 