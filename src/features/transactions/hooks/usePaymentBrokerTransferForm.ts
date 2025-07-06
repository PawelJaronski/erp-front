import { useState, useCallback, useEffect } from 'react';
import {
  PaymentBrokerTransferFormData,
  BaseFormHookReturn,
} from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { paymentBrokerTransferValidator } from '../validators/paymentBrokerTransferValidator';
import { fetchSalesForDate } from '@/forms/simple-transaction-form/utils/sales';

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

  /* ------------------ sales cache & loading ------------------ */
  const [salesCache, setSalesCache] = useState<Record<string, number>>({});
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  const salesTotal = formData.sales_date ? salesCache[formData.sales_date] : undefined;

  // auto-fetch sales when sales_date changes
  useEffect(() => {
    const date = formData.sales_date;
    if (!date) return;
    if (salesCache[date]) return; // cached

    let cancelled = false;
    setSalesLoading(true);
    fetchSalesForDate(date)
      .then((data) => {
        if (cancelled) return;
        setSalesCache((prev) => ({ ...prev, [date]: data.total }));
        setSalesError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to load sales';
        setSalesError(msg);
      })
      .finally(() => {
        if (!cancelled) setSalesLoading(false);
      });

    return () => {
      cancelled = true;
      setSalesLoading(false);
    };
  }, [formData.sales_date, salesCache]);

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

  const retrySalesFetch = useCallback(() => {
    if (!formData.sales_date) return;
    // remove cached error and force refetch by removing cache entry
    setSalesCache((prev) => {
      const clone = { ...prev };
      delete clone[formData.sales_date!];
      return clone;
    });
    setSalesError(null);
  }, [formData.sales_date]);

  type Extra = {
    salesTotal?: number;
    salesLoading: boolean;
    salesError: string | null;
    retrySalesFetch: () => void;
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset,
    salesTotal,
    salesLoading,
    salesError,
    retrySalesFetch,
  } as BaseFormHookReturn<PaymentBrokerTransferFormData> & Extra;
} 