import { useState, useCallback } from 'react';
import { SimpleIncomeFormData, BaseFormHookReturn } from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { simpleIncomeValidator } from '../validators/simpleIncomeValidator';

const defaultSimpleIncomeState: SimpleIncomeFormData = {
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

interface UseSimpleIncomeFormProps {
  onSubmit: (data: SimpleIncomeFormData) => Promise<void>;
}

export function useSimpleIncomeForm({ onSubmit }: UseSimpleIncomeFormProps): BaseFormHookReturn<SimpleIncomeFormData> {
  const [formData, setFormData] = useState<SimpleIncomeFormData>(defaultSimpleIncomeState);
  const { errors, validate, clearError } = useValidation(simpleIncomeValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback(<K extends keyof SimpleIncomeFormData>(field: K, value: SimpleIncomeFormData[K]) => {
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
    setFormData(defaultSimpleIncomeState);
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