import type {
  SimpleExpenseFormData,
  SimpleIncomeFormData,
  SimpleTransferFormData,
  PaymentBrokerTransferFormData,
} from '@/features/transactions/types';
import type { TransactionType } from '@/shared/contracts/transactions';
import type { TransactionRequest } from '@/shared/contracts/transactions';
import { normalizeAmount, parseAmount } from '@/shared/utils/amount';

// Union helper for convenience
export type AnyFormData =
  | SimpleExpenseFormData
  | SimpleIncomeFormData
  | SimpleTransferFormData
  | PaymentBrokerTransferFormData;

/**
 * Build API payload adhering to the shared TransactionRequest contract.
 * Logic based on legacy implementation now centralised for all new forms.
 */
export function buildTransactionPayload(
  form: AnyFormData,
  transaction_type: TransactionType,
): TransactionRequest {
  // Prepare base skeleton shared by all types
  const base: Omit<TransactionRequest, 'event_type' | 'transaction_type'> = {
    account: (form as { account: string }).account,
    business_timestamp: (form as { business_timestamp: string }).business_timestamp,
    category_group: '', // will be filled per-case
    category: '', // will be filled per-case
  } as unknown as Omit<TransactionRequest, 'event_type' | 'transaction_type'>;

  // Helper to copy common optional fields without casting to any
  const copyOptionalCommons = (
    target: Partial<TransactionRequest>,
    source: typeof form,
  ) => {
    if ('business_reference' in source && source.business_reference?.trim()) {
      target.business_reference = source.business_reference.trim();
    }
    if ('item' in source && source.item?.trim()) {
      target.item = source.item.trim();
    }
    if ('note' in source && source.note?.trim()) {
      target.note = source.note.trim();
    }
  };

  let payload: TransactionRequest;

  switch (transaction_type) {
    case 'simple_expense': {
      const data = form as SimpleExpenseFormData;
      const category_group = data.category_group === 'other' ? data.custom_category_group ?? '' : data.category_group;
      const category = data.category === 'other' ? data.custom_category ?? '' : data.category;

      payload = {
        ...base,
        transaction_type,
        event_type: 'cost_paid',
        category_group,
        category,
        gross_amount: normalizeAmount(data.gross_amount || ''),
      } as TransactionRequest;

      if (data.include_tax) {
        payload.include_tax = data.include_tax;
        payload.tax_rate = data.tax_rate;
      }

      copyOptionalCommons(payload, data);
      break;
    }

    case 'simple_income': {
      const data = form as SimpleIncomeFormData;
      const category_group = data.category_group === 'other' ? data.custom_category_group ?? '' : data.category_group;
      const category = data.category === 'other' ? data.custom_category ?? '' : data.category;

      payload = {
        ...base,
        transaction_type,
        event_type: 'income_received',
        category_group,
        category,
        gross_amount: normalizeAmount(data.gross_amount || ''),
      } as TransactionRequest;

      if (data.include_tax) {
        payload.include_tax = data.include_tax;
        payload.tax_rate = data.tax_rate;
      }

      copyOptionalCommons(payload, data);
      break;
    }

    case 'simple_transfer': {
      const data = form as SimpleTransferFormData;

      payload = {
        ...base,
        transaction_type,
        event_type: 'transfer',
        category_group: 'internal_transfer',
        category: 'outgoing_transfer',
        gross_amount: normalizeAmount(data.gross_amount || ''),
        to_account: data.to_account,
      } as TransactionRequest;

      copyOptionalCommons(payload, data);
      break;
    }

    case 'payment_broker_transfer': {
      const data = form as PaymentBrokerTransferFormData;
      const paynow = parseAmount(data.paynow_transfer || '0');
      const autopay = parseAmount(data.autopay_transfer || '0');
      const total = paynow + autopay;

      payload = {
        ...base,
        transaction_type,
        // static mapping per backend contract
        account: 'paynow',
        event_type: 'transfer',
        category_group: 'payment_broker_transfer',
        category: 'paynow_payout',
        gross_amount: normalizeAmount(total.toString()),
        paynow_transfer: paynow ? paynow.toString() : undefined,
        autopay_transfer: autopay ? autopay.toString() : undefined,
        transfer_date: data.transfer_date,
        sales_date: data.sales_date,
      } as TransactionRequest;

      copyOptionalCommons(payload, data);
      break;
    }
  }

  // Clean undefined / empty string fields to make backend happy
  Object.keys(payload).forEach((k) => {
    const key = k as keyof TransactionRequest;
    const val = payload[key];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete payload[key];
    }
  });

  return payload;
} 