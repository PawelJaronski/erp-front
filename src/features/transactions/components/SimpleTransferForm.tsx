"use client";
import React, { useState } from 'react';
import { SimpleTransferFormData } from '../types';
import { useSimpleTransferForm } from '../hooks/useSimpleTransferForm';
import { FormField, AccountSelect, AmountInput, DateInput } from '@/shared/components/form';
import { FormActions } from '.';

interface Props {
  onSubmit: (data: SimpleTransferFormData) => Promise<void>;
  onCancel: () => void;
}

export function SimpleTransferForm({ onSubmit, onCancel }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const internalSubmit = async (data: SimpleTransferFormData) => {
    await onSubmit(data);
    setSubmitted(true);
  };

  const { formData, errors, isSubmitting, handleFieldChange, handleSubmit, reset } =
    useSimpleTransferForm({ onSubmit: internalSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="From Account" error={errors.account} required>
          <AccountSelect
            value={formData.account}
            onChange={(v) => handleFieldChange('account', v)}
            error={errors.account}
          />
        </FormField>
        <FormField label="To Account" error={errors.to_account} required>
          <AccountSelect
            value={formData.to_account}
            onChange={(v) => handleFieldChange('to_account', v)}
            error={errors.to_account}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Amount (zł)" error={errors.gross_amount} required>
          <AmountInput
            value={formData.gross_amount}
            onChange={(v) => handleFieldChange('gross_amount', v)}
            error={errors.gross_amount}
          />
        </FormField>
        <FormField label="Business Date" error={errors.business_timestamp} required>
          <DateInput
            value={formData.business_timestamp}
            onChange={(v) => handleFieldChange('business_timestamp', v)}
          />
        </FormField>
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={reset}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />

      {submitted && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          Transfer saved successfully.
        </p>
      )}
    </form>
  );
} 