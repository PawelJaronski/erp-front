export type TransactionType =
  | 'simple_expense'
  | 'simple_income'
  | 'simple_transfer'
  | 'payment_broker_transfer';

export interface TransactionRequest {
  transaction_type: TransactionType;
  event_type: 'cost_paid' | 'income_received' | 'transfer';
  account: string;
  category_group: string;
  category: string;
  gross_amount?: string | number;
  business_timestamp: string; // ISO yyyy-mm-dd
  business_reference?: string;
  item?: string;
  note?: string;
  include_tax?: boolean;
  tax_rate?: number;
  // simple transfer
  to_account?: string;
  // broker transfer
  paynow_transfer?: string;
  autopay_transfer?: string;
  transfer_date?: string; // ISO yyyy-mm-dd
  sales_date?: string; // ISO yyyy-mm-dd
} 