"use client";
import React from 'react';
import { SimpleExpenseFormData } from '../types';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormField, AccountSelect, AmountInput, DateInput } from '@/shared/components/form';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

export function SimpleExpenseForm({ onSubmit, onCancel }: SimpleExpenseFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
  } = useSimpleExpenseForm({ onSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account */}
      <FormField label="Account" error={errors.account} required>
        <AccountSelect
          value={formData.account}
          onChange={(value) => handleFieldChange('account', value)}
          error={errors.account}
        />
      </FormField>

      {/* Amount */}
      <FormField label="Amount (zł)" error={errors.gross_amount} required>
        <AmountInput
          value={formData.gross_amount}
          onChange={(value) => handleFieldChange('gross_amount', value)}
          error={errors.gross_amount}
        />
      </FormField>

      {/* Business date */}
      <FormField label="Business Date" error={errors.business_timestamp} required>
        <DateInput
          value={formData.business_timestamp}
          onChange={(val) => handleFieldChange('business_timestamp', val)}
        />
      </FormField>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 