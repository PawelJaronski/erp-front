"use client";
import React from 'react';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormActions } from '.';
import { simpleExpenseFields } from './fieldsConfig';
import { simpleExpenseLayout2Col } from './layouts';
import { FormLayout } from './FormLayout';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';
import { SimpleExpenseFormData } from '../types';
import type { Layout } from './types';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  columns?: number;
  layout?: Layout;
}

export function SimpleExpenseForm({ onSubmit, columns = 2, layout }: SimpleExpenseFormProps) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleExpenseFormData) => {
    await onSubmit(data);
    const notificationData = { ...data, transaction_type: 'simple_expense' } as const;
    showToast(
      <TransactionNotification data={notificationData} />,
      'success',
    );
  };

  const formProps = useSimpleExpenseForm({ onSubmit: internalSubmit });

  // Adapter for handleFieldChange to match (field: string, value: any) => void
  const layoutFormProps = {
    ...formProps,
    handleFieldChange: (field: string, value: unknown) => {
      formProps.handleFieldChange(
        field as keyof SimpleExpenseFormData,
        value as SimpleExpenseFormData[keyof SimpleExpenseFormData],
      );
    },
  };

  return (
    <form onSubmit={formProps.handleSubmit} className="space-y-6">
      <FormLayout
        layout={layout || simpleExpenseLayout2Col}
        fieldsConfig={simpleExpenseFields}
        formProps={layoutFormProps}
        columns={columns}
      />
      <FormActions onSubmit={formProps.handleSubmit} onReset={formProps.reset} isSubmitting={formProps.isSubmitting} />
    </form>
  );
} 