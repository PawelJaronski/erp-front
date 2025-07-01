import { validateAmount } from "./amount";

export interface SimpleTransactionFormShape {
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;
  business_timestamp: string;
  transaction_type: string;
  custom_category_group?: string;
  custom_category?: string;
  include_tax: boolean;
  tax_rate: number;
  business_reference?: string;
  item?: string;
  note?: string;
  to_account?: string;
}

/**
 * Validate a transaction form. Returns a map of field names to error
 * messages. An *empty* object means the form is valid.
 */
export function validateSimpleTransactionForm(fields: SimpleTransactionFormShape): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.account.trim()) errors.account = "Select account";

  // Derive actual category_group & category accounting for the "other" option.
  const finalCategoryGroup = fields.category_group === "other" ? fields.custom_category_group ?? "" : fields.category_group;
  const finalCategory = fields.category === "other" ? fields.custom_category ?? "" : fields.category;

  if (!finalCategoryGroup.trim()) errors.category_group = "Select or enter category group";
  if (!finalCategory.trim()) errors.category = "Select or enter category";

  if (!fields.business_timestamp.trim()) errors.business_timestamp = "Select date";

  const amountError = validateAmount(fields.gross_amount);
  if (amountError) errors.gross_amount = amountError;

  return errors;
}