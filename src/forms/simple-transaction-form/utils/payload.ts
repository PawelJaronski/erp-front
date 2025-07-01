import { SimpleTransactionFormShape } from "./validation";
import { normalizeAmount } from "./amount";

interface SimpleTransactionPayload {
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
  to_account?: string;
}

/**
 * Build API payload adhering to the backend contract. Handles "other" custom
 * fields and amount normalization.
 */
export function buildSimpleTransactionPayload(form: SimpleTransactionFormShape): SimpleTransactionPayload {
  const category_group = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const category = form.category === "other" ? form.custom_category ?? "" : form.category;

  let event_type: string;
  let finalCategoryGroup: string = category_group;
  let finalCategory: string = category;

  if (form.transaction_type === "simple_transfer") {
    event_type = "transfer";
    finalCategoryGroup = "internal_transfer";
    finalCategory = "outgoing_transfer";
  } else {
    event_type = form.transaction_type === "simple_expense" ? "cost_paid" : "income_received";
  }

  const payload: SimpleTransactionPayload & { to_account?: string } = {
    transaction_type: form.transaction_type,
    event_type,
    account: form.account,
    category_group: finalCategoryGroup,
    category: finalCategory,
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
  if (form.transaction_type !== "simple_transfer" && form.include_tax) {
    payload.include_tax = form.include_tax;
    payload.tax_rate = form.tax_rate;
  }

  if (form.transaction_type === "simple_transfer") {
    payload.to_account = form.to_account ?? "";
  }

  return payload;
}
