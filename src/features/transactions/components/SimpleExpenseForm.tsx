"use client";
import React from 'react';
import { SimpleExpenseFormData } from '../types';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormField, DateInput } from '@/shared/components/form';
import { CategoryField, VATSection, FormActions, AccountSelect, AmountInput } from '.';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  /** kept optional for backward compatibility, ignored */
  onCancel?: () => void;
}

export function SimpleExpenseForm({ onSubmit }: SimpleExpenseFormProps) {
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
      {/* Account row – half width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Account" error={errors.account} required>
          <AccountSelect
            value={formData.account}
            onChange={(value) => handleFieldChange('account', value)}
            error={errors.account}
          />
        </FormField>
      </div>

      {/* Category row */}
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

      {/* Amount & Item row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Amount (zł)" error={errors.gross_amount} required>
          <AmountInput
            value={formData.gross_amount}
            onChange={(value) => handleFieldChange('gross_amount', value)}
            error={errors.gross_amount}
          />
        </FormField>

        <FormField label="Item / Description">
          <input
            type="text"
            value={formData.item || ''}
            onChange={(e) => handleFieldChange('item', e.target.value)}
            placeholder="Short item description (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>
      </div>

      {/* Note & Business Reference row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Note">
          <input
            type="text"
            value={formData.note || ''}
            onChange={(e) => handleFieldChange('note', e.target.value)}
            placeholder="Internal note (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>

        <FormField label="Business Reference">
          <input
            type="text"
            value={formData.business_reference || ''}
            onChange={(e) => handleFieldChange('business_reference', e.target.value)}
            placeholder="Invoice #123 / Transfer title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>
      </div>

      {/* VAT toggle & Business Date row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <VATSection
          includeTax={formData.include_tax}
          taxRate={formData.tax_rate}
          onIncludeTaxChange={(v) => handleFieldChange('include_tax', v)}
          onTaxRateChange={(v) => handleFieldChange('tax_rate', v)}
        />

        <FormField label="Business Date" error={errors.business_timestamp} required>
          <DateInput
            value={formData.business_timestamp}
            onChange={(val) => handleFieldChange('business_timestamp', val)}
          />
        </FormField>
      </div>

      {/* Actions */}
      <FormActions onSubmit={handleSubmit} onReset={reset} isSubmitting={isSubmitting} />
    </form>
  );
} 