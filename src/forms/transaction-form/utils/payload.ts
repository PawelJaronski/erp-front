import { TransactionFormShape } from "./validation";
import { normalizeAmount } from "./amount";

interface TransactionPayload {
  transaction_type: string;
  event_type: string;
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;
  business_timestamp: string;
  business_reference?: string;
  item?: string;
  note?: string;
  include_tax?: boolean;
  tax_rate?: number;
}

/**
 * Build API payload adhering to the backend contract. Handles "other" custom
 * fields and amount normalization.
 */
export function buildTransactionPayload(form: TransactionFormShape): TransactionPayload {
  const category_group = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const category = form.category === "other" ? form.custom_category ?? "" : form.category;

  // Determine event_type based on transaction_type
  const event_type = form.transaction_type === "expense" ? "cost_paid" : "income_received";

  const payload: TransactionPayload = {
    transaction_type: form.transaction_type,  // Change from hardcoded
    event_type,                               // Dynamic based on transaction_type
    account: form.account,
    category_group,
    category,
    gross_amount: normalizeAmount(form.gross_amount),
    business_timestamp: form.business_timestamp,
  };

  // Add optional fields only if they have values
  if (form.business_reference?.trim()) {
    payload.business_reference = form.business_reference;
  }
  if (form.item?.trim()) {
    payload.item = form.item;
  }
  if (form.note?.trim()) {
    payload.note = form.note;
  }
  if (form.include_tax) {
    payload.include_tax = form.include_tax;
    payload.tax_rate = form.tax_rate;
  }

  return payload;
}
