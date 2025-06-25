import { ExpenseFormShape } from "./validation";
import { normalizeAmount } from "./amount";

interface ExpensePayload {
  transaction_type: "expense";
  event_type: "cost_paid";
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;
  business_timestamp: string;
}

/**
 * Build API payload adhering to the backend contract. Handles "other" custom
 * fields and amount normalization.
 */
export function buildExpensePayload(form: ExpenseFormShape): ExpensePayload {
  const category_group = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const category = form.category === "other" ? form.custom_category ?? "" : form.category;

  return {
    transaction_type: "expense",
    event_type: "cost_paid",
    account: form.account,
    category_group,
    category,
    gross_amount: normalizeAmount(form.gross_amount),
    business_timestamp: form.business_timestamp,
  } as const;
} 