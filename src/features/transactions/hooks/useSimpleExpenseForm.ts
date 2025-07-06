import { useState, useCallback } from 'react';
import { SimpleExpenseFormData, BaseFormHookReturn } from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { simpleExpenseValidator } from '../validators/simpleExpenseValidator';

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
  const [formData, setFormData] = useState<SimpleExpenseFormData>(defaultSimpleExpenseState);
  const { errors, validate, clearError } = useValidation(simpleExpenseValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback(<K extends keyof SimpleExpenseFormData>(field: K, value: SimpleExpenseFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field as string);
  }, [clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length === 0) {
      await submit(() => onSubmit(formData));
    }
  }, [formData, validate, submit, onSubmit]);

  const reset = useCallback(() => {
    setFormData(defaultSimpleExpenseState);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
  };
} 