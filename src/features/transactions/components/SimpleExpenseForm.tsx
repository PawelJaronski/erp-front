"use client";
import React, { useState } from 'react';
import { SimpleExpenseFormData } from '../types';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormField, AccountSelect, AmountInput, DateInput } from '@/shared/components/form';
import { CategoryField, VATSection, FormActions } from '.';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

export function SimpleExpenseForm({ onSubmit, onCancel }: SimpleExpenseFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const internalSubmit = async (data: SimpleExpenseFormData) => {
    await onSubmit(data);
    setSubmitted(true);
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

      {submitted && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          Expense saved successfully.
        </p>
      )}
    </form>
  );
} 