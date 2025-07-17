"use client";
import React from 'react';
import { SimpleTransferFormData } from '../types';
import { useSimpleTransferForm } from '../hooks/useSimpleTransferForm';
import { FormField, DateInput } from '@/shared/components/form';
import { FormActions, AccountSelect, AmountInput } from '.';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface Props {
  onSubmit: (data: SimpleTransferFormData) => Promise<void>;
  onCancel?: () => void;
}

export function SimpleTransferForm({ onSubmit }: Props) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleTransferFormData) => {
    await onSubmit(data);
    const notificationData = { ...data, transaction_type: 'simple_transfer' } as unknown as Parameters<typeof TransactionNotification>[0]['data'];
    showToast(<TransactionNotification data={notificationData} />, 'success');
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
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Amount" error={errors.gross_amount} required>
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
        isSubmitting={isSubmitting}
      />
    </form>
  );
} 