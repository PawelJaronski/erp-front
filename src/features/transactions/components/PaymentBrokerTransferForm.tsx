"use client";
import React, { useState } from 'react';
import { PaymentBrokerTransferFormData } from '../types';
import { usePaymentBrokerTransferForm } from '../hooks/usePaymentBrokerTransferForm';
import { FormField, AmountInput, DateInput } from '@/shared/components/form';
import { FormActions } from '.';

interface Props {
  onSubmit: (data: PaymentBrokerTransferFormData) => Promise<void>;
  onCancel: () => void;
}

export function PaymentBrokerTransferForm({ onSubmit, onCancel }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const internalSubmit = async (data: PaymentBrokerTransferFormData) => {
    await onSubmit(data);
    setSubmitted(true);
  };

  const { formData, errors, isSubmitting, handleFieldChange, handleSubmit, reset } =
    usePaymentBrokerTransferForm({ onSubmit: internalSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Paynow Transfer (zł)" error={errors.paynow_transfer}>
          <AmountInput
            value={formData.paynow_transfer || ''}
            onChange={(v) => handleFieldChange('paynow_transfer', v)}
            error={errors.paynow_transfer}
          />
        </FormField>
        <FormField label="Autopay Transfer (zł)" error={errors.autopay_transfer}>
          <AmountInput
            value={formData.autopay_transfer || ''}
            onChange={(v) => handleFieldChange('autopay_transfer', v)}
            error={errors.autopay_transfer}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Transfer Date" error={errors.transfer_date} required>
          <DateInput
            value={formData.transfer_date || ''}
            onChange={(v) => handleFieldChange('transfer_date', v)}
          />
        </FormField>
        <FormField label="Sales Date" error={errors.sales_date} required>
          <DateInput
            value={formData.sales_date || ''}
            onChange={(v) => handleFieldChange('sales_date', v)}
          />
        </FormField>
      </div>

      {/* TODO: add sales summary preview in Phase 4 */}

      <FormActions onSubmit={handleSubmit} onReset={reset} onCancel={onCancel} isSubmitting={isSubmitting} />

      {submitted && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          Broker transfer saved successfully.
        </p>
      )}
    </form>
  );
} 