import { SimpleTransactionFormShape } from "./validation";
import { normalizeAmount, parseAmount } from "./amount";

interface SimpleTransactionPayload {
  transaction_type: string;
  event_type: string;
  account: string;
  category_group: string;
  category: string;
  gross_amount?: string | number;
  business_timestamp: string;
  business_reference?: string;
  item?: string;
  note?: string;
  include_tax?: boolean;
  tax_rate?: number;
  to_account?: string;
  paynow_transfer?: string;
  autopay_transfer?: string;
  transfer_date?: string;
  sales_date?: string;
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

  if (form.transaction_type === "simple_transfer" || form.transaction_type === "payment_broker_transfer") {
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
  if (!["simple_transfer", "payment_broker_transfer"].includes(form.transaction_type) && form.include_tax) {
    payload.include_tax = form.include_tax;
    payload.tax_rate = form.tax_rate;
  }

  if (form.transaction_type === "payment_broker_transfer") {
    // Static mapping per backend contract
    payload.category_group = "payment_broker_transfer";
    payload.category = "paynow_payout";
    payload.account = "paynow";

    const paynow = parseAmount(form.paynow_transfer || "0");
    const autopay = parseAmount(form.autopay_transfer || "0");
    const total = paynow + autopay;

    payload.gross_amount = normalizeAmount(total.toString());

    payload.business_timestamp = form.transfer_date ?? "";
    if (form.transfer_date) {
      payload.transfer_date = form.transfer_date;
    }
    if (form.sales_date) {
      payload.sales_date = form.sales_date;
    }

    payload.paynow_transfer = paynow.toString();
    payload.autopay_transfer = autopay.toString();
  } else {
    // For all other transaction types we send gross_amount as string
    payload.gross_amount = normalizeAmount(form.gross_amount);

    if (form.transaction_type === "simple_transfer") {
      payload.to_account = form.to_account ?? "";
    }
  }

  // Usuń pola o wartości null, undefined lub pusty string
  Object.keys(payload).forEach(
    (key) => {
      const k = key as keyof typeof payload;
      if (payload[k] === undefined || payload[k] === null || payload[k] === "") {
        delete (payload as any)[k];
      }
    }
  );

  return payload;
}
