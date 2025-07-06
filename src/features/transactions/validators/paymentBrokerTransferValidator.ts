import { PaymentBrokerTransferFormData } from '../types';
import { validateAmount } from '@/shared/utils/amount';

/**
 * Validation rules for Payment Broker Transfer form.
 */
export function paymentBrokerTransferValidator(
  data: PaymentBrokerTransferFormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Require transfer_date and sales_date
  if (!data.transfer_date?.trim()) {
    errors.transfer_date = 'Select transfer date';
  }
  if (!data.sales_date?.trim()) {
    errors.sales_date = 'Select sales date';
  }

  // Date gap rule – transfer must be >= sales + 1d
  if (data.transfer_date && data.sales_date) {
    const t = new Date(data.transfer_date).getTime();
    const s = new Date(data.sales_date).getTime();
    if (t - s < 86400000) {
      errors.transfer_date = 'transfer_date must be at least 1 day after sales_date';
    }
  }

  // At least one transfer amount and positive
  const paynowError = data.paynow_transfer ? validateAmount(data.paynow_transfer) : undefined;
  const autopayError = data.autopay_transfer ? validateAmount(data.autopay_transfer) : undefined;

  if (paynowError) errors.paynow_transfer = paynowError;
  if (autopayError) errors.autopay_transfer = autopayError;

  if (!(data.paynow_transfer?.trim() || '') && !(data.autopay_transfer?.trim() || '')) {
    errors.paynow_transfer = 'Enter at least one amount';
  }

  return errors;
} 