"use client";
import React from 'react';
import { PaymentBrokerTransferFormData } from '../types';
import { usePaymentBrokerTransferForm } from '../hooks/usePaymentBrokerTransferForm';
import { FormField, AmountInput, DateInput } from '@/shared/components/form';
import { FormActions } from '.';
import { TransactionNotification } from './TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface Props {
  onSubmit: (data: PaymentBrokerTransferFormData) => Promise<void>;
  onCancel: () => void;
}

export function PaymentBrokerTransferForm({ onSubmit, onCancel }: Props) {
  const { showToast } = useToast();

  const internalSubmit = async (data: PaymentBrokerTransferFormData) => {
    await onSubmit(data);
    const notificationData = { ...data, transaction_type: 'payment_broker_transfer' } as unknown as Parameters<typeof TransactionNotification>[0]['data'];
    showToast(<TransactionNotification data={notificationData} />, 'success');
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
    salesTotal,
    salesLoading,
    salesError,
    retrySalesFetch,
  } = usePaymentBrokerTransferForm({ onSubmit: internalSubmit }) as ReturnType<typeof usePaymentBrokerTransferForm> & {
    salesTotal?: number;
    salesLoading: boolean;
    salesError: string | null;
    retrySalesFetch: () => void;
  };

  const transfersSum =
    (Number((formData.paynow_transfer || '').replace(',', '.')) || 0) +
    (Number((formData.autopay_transfer || '').replace(',', '.')) || 0);

  const commissionDiff =
    salesTotal !== undefined ? Number((salesTotal - transfersSum).toFixed(2)) : undefined;

  const saveDisabled = isSubmitting || salesLoading || salesError !== null;

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

      {/* Preview Section */}
      {formData.sales_date && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Commission Preview</p>
          {salesLoading ? (
            <div className="h-14 animate-pulse bg-gray-200 rounded" />
          ) : (
            <div className="space-y-1 text-sm">
              <p>Total sales on {formData.sales_date}: <span className="font-semibold">{salesTotal?.toFixed(2) ?? "–"} zł</span></p>
              <p>Total transfers entered: <span className="font-semibold">{transfersSum.toFixed(2)} zł</span></p>
              {commissionDiff !== undefined && (
                <p>Commission difference: <span className="font-semibold">{commissionDiff.toFixed(2)} zł</span></p>
              )}
            </div>
          )}
          {salesError && (
            <div className="mt-2 text-red-700 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm mb-2">{salesError}</p>
              <button
                type="button"
                onClick={retrySalesFetch}
                className="px-4 py-2 text-sm font-semibold text-red-700 border border-red-600 rounded hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      <FormActions
        onSubmit={handleSubmit}
        onReset={reset}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        saveDisabled={saveDisabled}
      />
    </form>
  );
} 