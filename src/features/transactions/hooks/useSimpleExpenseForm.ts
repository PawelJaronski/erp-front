import React, { useCallback, useMemo } from 'react';
import { SimpleExpenseFormData, BaseFormHookReturn } from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { useFormPersistence } from '@/shared/hooks/useFormPersistence';
import { simpleExpenseValidator } from '../validators/simpleExpenseValidator';
import { filterCategories } from '../utils/categoryFiltering';

const defaultSimpleExpenseState: SimpleExpenseFormData = {
  gross_amount: '',
  account: 'mbank_osobiste',
  category_group: 'opex',
  category: '',
  business_reference: '',
  item: '',
  note: '',
  business_timestamp: new Date().toISOString().split('T')[0],
  tax_rate: 23,
  include_tax: false,
  custom_category_group: '',
  custom_category: '',
};

interface UseSimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
}

export function useSimpleExpenseForm({ onSubmit }: UseSimpleExpenseFormProps): BaseFormHookReturn<SimpleExpenseFormData> {
  const { state: formData, updateState, resetState } = useFormPersistence(defaultSimpleExpenseState, 'simple_expense');
  const { errors, validate, clearError } = useValidation(simpleExpenseValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const filteredCategories = useMemo(() => {
    return filterCategories({
      categoryGroup: formData.category_group,
      category: formData.category,
    });
  }, [formData.category_group, formData.category]);

  const handleFieldChange = useCallback(<K extends keyof SimpleExpenseFormData>(field: K, value: SimpleExpenseFormData[K]) => {
    updateState({ [field]: value });
    clearError(field as string);
  }, [updateState, clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length === 0) {
      await submit(() => onSubmit(formData));
      resetState();
    }
  }, [formData, validate, submit, onSubmit, resetState]);

  const reset = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
    availableCategories: filteredCategories,
  };
} 