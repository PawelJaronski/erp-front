"use client";
import React from 'react';
import { usePaymentBrokerTransferForm } from '@/features/transactions/hooks/usePaymentBrokerTransferForm';
import { FormActions } from '../shared/actions/FormActions';
import { FormLayout } from '../FormLayout';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';
import { PaymentBrokerTransferFormData } from '@/features/transactions/types';
import type { Layout } from '@/features/transactions/components/types';

const paymentBrokerTransferFields = [
  { name: "paynow_transfer", type: "amount", label: "Paynow Transfer" },
  { name: "autopay_transfer", type: "amount", label: "Autopay Transfer" },
  { name: "transfer_date", type: "date", label: "Transfer Date", required: true },
  { name: "sales_date", type: "date", label: "Sales Date", required: true },
];

const paymentBrokerTransferLayout2Col = [
  [{ name: "paynow_transfer" }, { name: "autopay_transfer" }],
  [{ name: "transfer_date" }, { name: "sales_date" }],
];

interface PaymentBrokerTransferFormProps {
  onSubmit: (data: PaymentBrokerTransferFormData) => Promise<void>;
  columns?: number;
  layout?: Layout;
}

export function PaymentBrokerTransferForm({ onSubmit, columns = 2, layout }: PaymentBrokerTransferFormProps) {
  const { showToast } = useToast();

  const internalSubmit = async (data: PaymentBrokerTransferFormData) => {
    await onSubmit(data);
    showToast(
      <TransactionNotification data={{ ...data, transaction_type: 'payment_broker_transfer' } as const} />,
      'success',
    );
  };

  const formProps = usePaymentBrokerTransferForm({ onSubmit: internalSubmit }) as ReturnType<typeof usePaymentBrokerTransferForm> & {
    salesTotal?: number;
    salesLoading: boolean;
    salesError: string | null;
    retrySalesFetch: () => void;
  };

  // Adapter: zachowuje typowanie i logikę automatycznej korekty dat
  const layoutFormProps = {
    ...formProps,
    handleFieldChange: (field: string, value: unknown) => {
      formProps.handleFieldChange(
        field as keyof PaymentBrokerTransferFormData,
        value as PaymentBrokerTransferFormData[keyof PaymentBrokerTransferFormData],
      );
    },
  };

  const transfersSum =
    (Number((formProps.formData.paynow_transfer || '').replace(',', '.')) || 0) +
    (Number((formProps.formData.autopay_transfer || '').replace(',', '.')) || 0);

  const commissionDiff =
    formProps.salesTotal !== undefined ? Number((formProps.salesTotal - transfersSum).toFixed(2)) : undefined;

  const saveDisabled = formProps.isSubmitting || formProps.salesLoading || formProps.salesError !== null;

  return (
    <form onSubmit={formProps.handleSubmit} className="space-y-6">
      <FormLayout
        layout={layout || paymentBrokerTransferLayout2Col}
        fieldsConfig={paymentBrokerTransferFields}
        formProps={layoutFormProps as unknown as import('@/features/transactions/components/types').SimpleExpenseFormPropsFromHook}
        columns={columns}
      />
      {/* Preview Section */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="space-y-1 text-sm">
          <p>Suma sprzedaży: <span className="font-semibold">
            {formProps.salesTotal !== undefined ? `${formProps.salesTotal.toFixed(2)} zł` : "-"}
            </span></p>
          <p>Suma przelewów: <span className="font-semibold">
            {transfersSum > 0 ? `${transfersSum.toFixed(2)} zł` : "-"}</span></p>
          <p>Prowizja: <span className="font-semibold">
            {commissionDiff !== undefined ? `${commissionDiff.toFixed(2)} zł` : "–"}
            </span></p>
          {formProps.salesTotal !== undefined && transfersSum > formProps.salesTotal && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm font-medium">
                Suma przelewów przekracza sumę sprzedaży
              </p>
            </div>
          )}
        </div>
        {formProps.salesError && (
          <div className="mt-2 text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm mb-2">{formProps.salesError}</p>
            <button
              type="button"
              onClick={formProps.retrySalesFetch}
              className="px-4 py-2 text-sm font-semibold text-red-700 border border-red-600 rounded hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <FormActions
        onSubmit={formProps.handleSubmit}
        onReset={formProps.reset}
        isSubmitting={formProps.isSubmitting}
        saveDisabled={saveDisabled}
      />
    </form>
  );
} 