"use client";
import React from 'react';
import { PaymentBrokerTransferFormData } from '../types';
import { usePaymentBrokerTransferForm } from '../hooks/usePaymentBrokerTransferForm';
import { FormField, AmountInput, DateInput } from '@/shared/components/form';
import { FormActions } from '.';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface Props {
  onSubmit: (data: PaymentBrokerTransferFormData) => Promise<void>;
  onCancel?: () => void;
}

export function PaymentBrokerTransferForm({ onSubmit }: Props) {
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
      
        <div className="p-4 border rounded-lg bg-gray-50">
          
            <div className="space-y-1 text-sm">
              <p>Suma sprzedaży: <span className="font-semibold">
                {salesTotal !== undefined ? `${salesTotal.toFixed(2)} zł` : "-"}
                </span></p>
              <p>Suma przelewów: <span className="font-semibold">
                {transfersSum > 0 ? `${transfersSum.toFixed(2)} zł` : "-"}</span></p>
              
                <p>Prowizja: <span className="font-semibold">
                  {commissionDiff !== undefined ? `${commissionDiff.toFixed(2)} zł` : "–"}
                  </span></p>
              

              {}
              {salesTotal !== undefined && transfersSum > salesTotal && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm font-medium">
                    Suma przelewów przekracza sumę sprzedaży
                  </p>
                </div>
              )}
            </div>
          
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
      

      <FormActions
        onSubmit={handleSubmit}
        onReset={reset}
        isSubmitting={isSubmitting}
        saveDisabled={saveDisabled}
      />
    </form>
  );
} 