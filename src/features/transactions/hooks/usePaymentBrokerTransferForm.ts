import { useState, useCallback } from 'react';
import {
  PaymentBrokerTransferFormData,
  BaseFormHookReturn,
} from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { paymentBrokerTransferValidator } from '../validators/paymentBrokerTransferValidator';

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

const defaultState: PaymentBrokerTransferFormData = {
  paynow_transfer: '',
  autopay_transfer: '',
  transfer_date: today,
  sales_date: yesterday,
  business_timestamp: today,
  business_reference: '',
  item: '',
  note: '',
};

interface Props {
  onSubmit: (data: PaymentBrokerTransferFormData) => Promise<void>;
}

export function usePaymentBrokerTransferForm({ onSubmit }: Props): BaseFormHookReturn<PaymentBrokerTransferFormData> {
  const [formData, setFormData] = useState<PaymentBrokerTransferFormData>(defaultState);
  const { errors, validate, clearError } = useValidation(paymentBrokerTransferValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback(<K extends keyof PaymentBrokerTransferFormData>(field: K, value: PaymentBrokerTransferFormData[K]) => {
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
    setFormData(defaultState);
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