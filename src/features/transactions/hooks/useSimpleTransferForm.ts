import { useState, useCallback } from 'react';
import {
  SimpleTransferFormData,
  BaseFormHookReturn,
} from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { simpleTransferValidator } from '../validators/simpleTransferValidator';

const defaultSimpleTransferState: SimpleTransferFormData = {
  account: 'mbank_firmowe',
  to_account: 'mbank_osobiste',
  gross_amount: '',
  business_reference: '',
  item: '',
  note: '',
  business_timestamp: new Date().toISOString().split('T')[0],
};

interface UseSimpleTransferFormProps {
  onSubmit: (data: SimpleTransferFormData) => Promise<void>;
}

export function useSimpleTransferForm({
  onSubmit,
}: UseSimpleTransferFormProps): BaseFormHookReturn<SimpleTransferFormData> {
  const [formData, setFormData] = useState<SimpleTransferFormData>(
    defaultSimpleTransferState,
  );
  const { errors, validate, clearError } = useValidation(simpleTransferValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback(
    <K extends keyof SimpleTransferFormData>(
      field: K,
      value: SimpleTransferFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      clearError(field as string);
    },
    [clearError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(formData);

      if (Object.keys(validationErrors).length === 0) {
        await submit(() => onSubmit(formData));
      }
    },
    [formData, validate, submit, onSubmit],
  );

  const reset = useCallback(() => {
    setFormData(defaultSimpleTransferState);
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