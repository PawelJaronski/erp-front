import { validateAmount } from "./amount";

export interface ExpenseFormShape {
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
}

/**
 * Validate a simple-expense form. Returns a map of field names to error
 * messages. An *empty* object means the form is valid.
 */
export function validateExpenseForm(form: ExpenseFormShape): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.account.trim()) errors.account = "Select account";

  // Derive actual category_group & category accounting for the "other" option.
  const finalCategoryGroup = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const finalCategory = form.category === "other" ? form.custom_category ?? "" : form.category;

  if (!finalCategoryGroup.trim()) errors.category_group = "Select or enter category group";
  if (!finalCategory.trim()) errors.category = "Select or enter category";

  if (!form.business_timestamp.trim()) errors.business_timestamp = "Select date";

  const amountError = validateAmount(form.gross_amount);
  if (amountError) errors.gross_amount = amountError;

  return errors;
} 