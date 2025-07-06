import { validateAmount } from "@/shared/utils/amount";

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
  /**
   * Payment broker transfer–specific fields (Phase 1)
   */
  transfer_date?: string;
  sales_date?: string;
  paynow_transfer?: string;
  autopay_transfer?: string;
}

/**
 * Validate a transaction form. Returns a map of field names to error
 * messages. An *empty* object means the form is valid.
 */
export function validateSimpleTransactionForm(fields: SimpleTransactionFormShape): Record<string, string> {
  const errors: Record<string, string> = {};

  if (fields.transaction_type !== "payment_broker_transfer" && !(fields.account?.trim() || "")) {
    errors.account = "Select account";
  }

  // Transfer-specific rules
  const isTransfer = fields.transaction_type === "simple_transfer";

  if (isTransfer) {
    if (!fields.to_account?.trim()) errors.to_account = "Select destination account";
    if (fields.to_account && fields.to_account === fields.account) {
      errors.to_account = "From and To accounts must differ";
    }
  } else if (fields.transaction_type !== "payment_broker_transfer") {
    // Expense / income rules – validate categories (NOT for broker transfer)
    const finalCategoryGroup = fields.category_group === "other" ? fields.custom_category_group ?? "" : fields.category_group;
    const finalCategory = fields.category === "other" ? fields.custom_category ?? "" : fields.category;

    if (!(finalCategoryGroup?.trim() || "")) errors.category_group = "Select or enter category group";
    if (!(finalCategory?.trim() || "")) errors.category = "Select or enter category";
  }

  if (fields.transaction_type !== "payment_broker_transfer" && !(fields.business_timestamp?.trim() || "")) {
    errors.business_timestamp = "Select date";
  }

  // Broker transfer requires transfer_date instead
  if (fields.transaction_type === "payment_broker_transfer") {
    if (!(fields.transfer_date?.trim() || "")) {
      errors.transfer_date = "Select transfer date";
    }
    if (!(fields.sales_date?.trim() || "")) {
      errors.sales_date = "Select sales date";
    }

    if (fields.transfer_date && fields.sales_date) {
      const t = new Date(fields.transfer_date).getTime();
      const s = new Date(fields.sales_date).getTime();
      if (t - s < 86400000) {
        errors.transfer_date = "transfer_date must be at least 1 day after sales_date";
      }
    }

    // Require at least one of paynow or autopay amount
    const paynowError = fields.paynow_transfer ? validateAmount(fields.paynow_transfer) : "";
    const autopayError = fields.autopay_transfer ? validateAmount(fields.autopay_transfer) : "";

    if (paynowError) errors.paynow_transfer = paynowError;
    if (autopayError) errors.autopay_transfer = autopayError;

    if (!(fields.paynow_transfer?.trim() || "") && !(fields.autopay_transfer?.trim() || "")) {
      errors.paynow_transfer = "Enter at least one amount";
    }
  }

  if (fields.transaction_type !== "payment_broker_transfer") {
    const amountError = validateAmount(fields.gross_amount || "");
    if (amountError) errors.gross_amount = amountError;
  }

  return errors;
}

// TODO: Deprecated – kept temporarily for legacy test suite.
export const validateExpenseForm = validateSimpleTransactionForm;