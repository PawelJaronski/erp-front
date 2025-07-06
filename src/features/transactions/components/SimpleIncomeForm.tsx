"use client";
import React from 'react';
import { SimpleIncomeFormData } from '../types';
import { useSimpleIncomeForm } from '../hooks/useSimpleIncomeForm';
import { FormField, AccountSelect, AmountInput, DateInput } from '@/shared/components/form';
import { CategoryField, VATSection, FormActions, OptionalDetailsSection } from '.';
import { TransactionNotification } from '@/features/transactions/components/TransactionNotification';
import { useToast } from '@/shared/components/ToastProvider';

interface Props {
  onSubmit: (data: SimpleIncomeFormData) => Promise<void>;
  onCancel?: () => void;
}

export function SimpleIncomeForm({ onSubmit }: Props) {
  const { showToast } = useToast();

  const internalSubmit = async (data: SimpleIncomeFormData) => {
    await onSubmit(data);
    const notificationData = { ...data, transaction_type: 'simple_income' } as unknown as Parameters<typeof TransactionNotification>[0]['data'];
    showToast(<TransactionNotification data={notificationData} />, 'success');
  };

  const { formData, errors, isSubmitting, handleFieldChange, handleSubmit, reset } =
    useSimpleIncomeForm({ onSubmit: internalSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account row – half width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Account" error={errors.account} required>
          <AccountSelect
            value={formData.account}
            onChange={(v) => handleFieldChange('account', v)}
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
          onCategoryGroupChange={(v) => handleFieldChange('category_group', v)}
          onCategoryChange={(v) => handleFieldChange('category', v)}
          onCustomCategoryGroupChange={(v) => handleFieldChange('custom_category_group', v)}
          onCustomCategoryChange={(v) => handleFieldChange('custom_category', v)}
          errors={errors}
        />
      </div>

      {/* Item / Note row */}
      <OptionalDetailsSection
        item={formData.item || ''}
        note={formData.note || ''}
        onItemChange={(v) => handleFieldChange('item', v)}
        onNoteChange={(v) => handleFieldChange('note', v)}
      />

      {/* Amount & Business Reference row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Amount (zł)" error={errors.gross_amount} required>
          <AmountInput
            value={formData.gross_amount}
            onChange={(v) => handleFieldChange('gross_amount', v)}
            error={errors.gross_amount}
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