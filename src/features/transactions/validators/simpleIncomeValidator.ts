import { SimpleIncomeFormData } from '../types';
import { validateAmount } from '@/shared/utils/amount';

export function simpleIncomeValidator(data: SimpleIncomeFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required field validation
  if (!data.account?.trim()) {
    errors.account = 'Select account';
  }

  const finalCategoryGroup =
    data.category_group === 'other' ? data.custom_category_group ?? '' : data.category_group;
  const finalCategory = data.category === 'other' ? data.custom_category ?? '' : data.category;

  if (!finalCategoryGroup?.trim()) {
    errors.category_group = 'Select or enter category group';
  }
  if (!finalCategory?.trim()) {
    errors.category = 'Select or enter category';
  }

  // Amount validation
  const amountError = validateAmount(data.gross_amount || '');
  if (amountError) {
    errors.gross_amount = amountError;
  }

  // Date validation
  if (!data.business_timestamp?.trim()) {
    errors.business_timestamp = 'Select date';
  }

  return errors;
} 