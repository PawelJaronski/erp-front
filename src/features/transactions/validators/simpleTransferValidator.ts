import { SimpleTransferFormData } from '../types';
import { validateAmount } from '@/shared/utils/amount';

export function simpleTransferValidator(data: SimpleTransferFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.account?.trim()) {
    errors.account = 'Select account';
  }

  if (!data.to_account?.trim()) {
    errors.to_account = 'Select destination account';
  }

  if (data.to_account && data.to_account === data.account) {
    errors.to_account = 'From and To accounts must differ';
  }

  const amountError = validateAmount(data.gross_amount || '');
  if (amountError) {
    errors.gross_amount = amountError;
  }

  if (!data.business_timestamp?.trim()) {
    errors.business_timestamp = 'Select date';
  }

  return errors;
} 