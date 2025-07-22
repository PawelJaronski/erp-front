"use client";
import React from 'react';
import { useSimpleTransferForm } from '../hooks/useSimpleTransferForm';
import { FormActions } from '.';
import { FormLayout } from './FormLayout';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';
import { SimpleTransferFormData } from '../types';

const simpleTransferFields = [
  { name: "account", type: "account", label: "From Account", required: true },
  { name: "to_account", type: "account", label: "To Account", required: true },
  { name: "gross_amount", type: "amount", label: "Amount", required: true },
  { name: "business_timestamp", type: "date", label: "Business Date", required: true },
];

const simpleTransferLayout2Col = [
  [{ name: "account", colSpan: 1, colStart: 1 }, { name: "to_account" }],
  [{ name: "gross_amount" }, { name: "business_timestamp" }],
];

interface SimpleTransferFormProps {
  onSubmit: (data: SimpleTransferFormData) => Promise<void>;
  columns?: number;
  layout?: any;
}

export function SimpleTransferForm({ onSubmit, columns = 2, layout }: SimpleTransferFormProps) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleTransferFormData) => {
    await onSubmit(data);
    showToast(
      <TransactionNotification data={{ ...data, transaction_type: "simple_transfer" } as SimpleTransferFormData & { transaction_type: "simple_transfer" }} />,
      'success'
    );
  };

  const formProps = useSimpleTransferForm({ onSubmit: internalSubmit });

  const layoutFormProps = {
    ...formProps,
    handleFieldChange: (field: string, value: any) => {
      formProps.handleFieldChange(field as keyof SimpleTransferFormData, value as SimpleTransferFormData[keyof SimpleTransferFormData]);
    }
  };

  return (
    <form onSubmit={formProps.handleSubmit} className="space-y-6">
      <FormLayout
        layout={layout || simpleTransferLayout2Col}
        fieldsConfig={simpleTransferFields}
        formProps={layoutFormProps}
        columns={columns}
      />
      <FormActions onSubmit={formProps.handleSubmit} onReset={formProps.reset} isSubmitting={formProps.isSubmitting} />
    </form>
  );
} 