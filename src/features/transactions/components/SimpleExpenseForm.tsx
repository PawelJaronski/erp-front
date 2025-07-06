"use client";
import React from 'react';
import { SimpleExpenseFormData } from '../types';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormField, AccountSelect, AmountInput, DateInput } from '@/shared/components/form';
import { CategoryField, VATSection, FormActions } from '.';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

export function SimpleExpenseForm({ onSubmit, onCancel }: SimpleExpenseFormProps) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleExpenseFormData) => {
    await onSubmit(data);
    // show type-aware notification toast
    const notificationData = { ...data, transaction_type: 'simple_expense' } as unknown as Parameters<typeof TransactionNotification>[0]['data'];
    showToast(<TransactionNotification data={notificationData} />, 'success');
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
  } = useSimpleExpenseForm({ onSubmit: internalSubmit });

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryField
          categoryGroup={formData.category_group}
          category={formData.category}
          customCategoryGroup={formData.custom_category_group}
          customCategory={formData.custom_category}
          onCategoryGroupChange={(value) => handleFieldChange('category_group', value)}
          onCategoryChange={(value) => handleFieldChange('category', value)}
          onCustomCategoryGroupChange={(value) => handleFieldChange('custom_category_group', value)}
          onCustomCategoryChange={(value) => handleFieldChange('custom_category', value)}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <FormField label="Amount (zł)" error={errors.gross_amount} required>
          <AmountInput
            value={formData.gross_amount}
            onChange={(value) => handleFieldChange('gross_amount', value)}
            error={errors.gross_amount}
          />
        </FormField>

        <FormField label="Business Date" error={errors.business_timestamp} required>
          <DateInput
            value={formData.business_timestamp}
            onChange={(val) => handleFieldChange('business_timestamp', val)}
          />
        </FormField>
      </div>

      {/* VAT */}
      <VATSection
        includeTax={formData.include_tax}
        taxRate={formData.tax_rate}
        onIncludeTaxChange={(v) => handleFieldChange('include_tax', v)}
        onTaxRateChange={(v) => handleFieldChange('tax_rate', v)}
      />

      {/* Actions */}
      <FormActions onSubmit={handleSubmit} onReset={reset} onCancel={onCancel} isSubmitting={isSubmitting} />
    </form>
  );
} 