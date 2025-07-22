"use client";
import React from 'react';
import { useSimpleIncomeForm } from '../hooks/useSimpleIncomeForm';
import { FormActions } from '.';
import { FormLayout } from './FormLayout';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';
import { SimpleIncomeFormData } from '../types';
import type { Layout } from './types';

const simpleIncomeFields = [
  { name: "account", type: "account", label: "Account", required: true },
  { name: "categoryGroup", type: "categoryGroup", label: "Category Group" },
  { name: "category", type: "category", label: "Category" },
  { name: "gross_amount", type: "amount", label: "Amount", required: true },
  { name: "item", type: "item", label: "Item" },
  { name: "note", type: "note", label: "Note" },
  { name: "business_reference", type: "text", label: "Business Reference" },
  { name: "include_tax", type: "vat", label: "Include VAT" },
  { name: "business_timestamp", type: "date", label: "Business Date", required: true },
];

const simpleIncomeLayout2Col = [
  [{ name: "account", colSpan: 1, colStart: 1 }],
  [{ name: "categoryGroup", colSpan: 1, colStart: 1 }, { name: "category" }],
  [{ name: "gross_amount" }, { name: "item" }],
  [{ name: "note" }, { name: "business_reference" }],
  [{ name: "include_tax" }, { name: "business_timestamp" }],
];

interface SimpleIncomeFormProps {
  onSubmit: (data: SimpleIncomeFormData) => Promise<void>;
  columns?: number;
  layout?: Layout;
}

export function SimpleIncomeForm({ onSubmit, columns = 2, layout }: SimpleIncomeFormProps) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleIncomeFormData) => {
    await onSubmit(data);
    showToast(
      <TransactionNotification data={{ ...data, transaction_type: 'simple_income' } as const} />,
      'success',
    );
  };

  const formProps = useSimpleIncomeForm({ onSubmit: internalSubmit });

  const layoutFormProps = {
    ...formProps,
    handleFieldChange: (field: string, value: unknown) => {
      formProps.handleFieldChange(
        field as keyof SimpleIncomeFormData,
        value as SimpleIncomeFormData[keyof SimpleIncomeFormData],
      );
    },
  };

  return (
    <form onSubmit={formProps.handleSubmit} className="space-y-6">
      <FormLayout
        layout={layout || simpleIncomeLayout2Col}
        fieldsConfig={simpleIncomeFields}
        formProps={layoutFormProps as unknown as import('./types').SimpleExpenseFormPropsFromHook}
        columns={columns}
      />
      <FormActions onSubmit={formProps.handleSubmit} onReset={formProps.reset} isSubmitting={formProps.isSubmitting} />
    </form>
  );
} 