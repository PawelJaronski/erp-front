import { useCallback } from 'react';
import { SimpleIncomeFormData, BaseFormHookReturn } from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { useFormPersistence } from '@/shared/hooks/useFormPersistence';
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
  const { state: formData, updateState, resetState } = useFormPersistence(defaultSimpleIncomeState, 'simple_income');
  const { errors, validate, clearError } = useValidation(simpleIncomeValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback(<K extends keyof SimpleIncomeFormData>(field: K, value: SimpleIncomeFormData[K]) => {
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
  };
} 