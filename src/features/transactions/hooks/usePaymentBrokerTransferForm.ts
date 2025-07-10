import { useState, useCallback, useEffect } from 'react';
import {
  PaymentBrokerTransferFormData,
  BaseFormHookReturn,
} from '../types';
import { useValidation } from '@/shared/hooks/useValidation';
import { useApiSubmission } from '@/shared/hooks/useApiSubmission';
import { useFormPersistence } from '@/shared/hooks/useFormPersistence';
import { paymentBrokerTransferValidator } from '../validators/paymentBrokerTransferValidator';
import { fetchSalesForDate } from '@/features/transactions/utils/sales';

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
  const { state: formData, updateState, resetState } = useFormPersistence(defaultState, 'payment_broker_transfer');
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

  /* --------------------------------------------------
   * Auto-adjust gap: ensure transfer_date ≥ sales_date + 1d
   * -------------------------------------------------- */
  useEffect(() => {
    const { transfer_date, sales_date } = formData;
    if (!transfer_date || !sales_date) return;

    const msDay = 86400000;
    const t = Date.parse(transfer_date);
    const s = Date.parse(sales_date);
    if (Number.isNaN(t) || Number.isNaN(s)) return;

    if (t - s < msDay) {
      const newSales = new Date(t - msDay).toISOString().split('T')[0];
      if (newSales !== sales_date) {
        updateState({ sales_date: newSales });
      }
    }
  }, [formData.transfer_date, formData.sales_date, updateState]);

  const handleFieldChange = useCallback(<K extends keyof PaymentBrokerTransferFormData>(field: K, value: PaymentBrokerTransferFormData[K]) => {
    updateState({ [field]: value });
    clearError(field as string);
  }, [updateState, clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData, { salesTotal });
    if (Object.keys(validationErrors).length === 0) {
      await submit(() => onSubmit(formData));
      resetState();
      // Clear sales cache on successful submit
      setSalesCache({});
      setSalesError(null);
    }
  }, [formData, validate, submit, onSubmit, resetState, salesTotal]);

  const reset = useCallback(() => {
    resetState();
    // Clear sales cache on reset
    setSalesCache({});
    setSalesError(null);
  }, [resetState]);

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