import React from "react";
import { FormField, DateInput } from '@/shared/components/form';
import { AccountSelect, CategoryGroupSelect, CategorySelect, AmountInput, TransactionItem, TransactionNote, VATSection } from ".";
import { FieldConfig, SimpleExpenseFormPropsFromHook } from "./types";

interface FieldRendererProps {
  field: FieldConfig;
  formProps: SimpleExpenseFormPropsFromHook;
}

export function FieldRenderer({ field, formProps }: FieldRendererProps) {
  switch (field.type) {
    case "account":
      // Rozróżniamy From/To Account po nazwie pola
      if (field.name === "account") {
        return <FormField label={field.label} error={formProps.errors.account} required={field.required}><AccountSelect value={formProps.formData.account} onChange={(v) => formProps.handleFieldChange("account", v)} /></FormField>;
      } else if (field.name === "to_account") {
        return <FormField label={field.label} error={formProps.errors.to_account} required={field.required}><AccountSelect value={formProps.formData.to_account} onChange={(v) => formProps.handleFieldChange("to_account", v)} /></FormField>;
      }
      return null;
    case "categoryGroup":
      return <CategoryGroupSelect value={formProps.formData.category_group} onChange={(v) => formProps.handleFieldChange("category_group", v)} error={formProps.errors.category_group} onCustomValueChange={() => {}} />;
    case "category":
      return <CategorySelect value={formProps.formData.category} onChange={(v) => formProps.handleFieldChange("category", v)} error={formProps.errors.category} availableCategories={formProps.availableCategories || []} onCustomValueChange={() => {}} />;
    case "amount":
      // Rozróżniamy różne amounty po nazwie pola
      if (field.name === "gross_amount") {
        return <FormField label={field.label} error={formProps.errors.gross_amount} required={field.required}><AmountInput value={formProps.formData.gross_amount} onChange={(v) => formProps.handleFieldChange("gross_amount", v)} error={formProps.errors.gross_amount} /></FormField>;
      } else if (field.name === "paynow_transfer") {
        return <FormField label={field.label} error={formProps.errors.paynow_transfer}><AmountInput value={formProps.formData.paynow_transfer || ''} onChange={(v) => formProps.handleFieldChange("paynow_transfer", v)} error={formProps.errors.paynow_transfer} /></FormField>;
      } else if (field.name === "autopay_transfer") {
        return <FormField label={field.label} error={formProps.errors.autopay_transfer}><AmountInput value={formProps.formData.autopay_transfer || ''} onChange={(v) => formProps.handleFieldChange("autopay_transfer", v)} error={formProps.errors.autopay_transfer} /></FormField>;
      }
      return null;
    case "item":
      return <TransactionItem value={formProps.formData.item || ''} onChange={(v) => formProps.handleFieldChange("item", v)} />;
    case "note":
      return <TransactionNote value={formProps.formData.note || ''} onChange={(v) => formProps.handleFieldChange("note", v)} />;
    case "text":
      if (field.name === "business_reference") {
        return <FormField label={field.label} error={formProps.errors.business_reference}><input type="text" value={formProps.formData.business_reference || ''} onChange={e => formProps.handleFieldChange("business_reference", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors" /></FormField>;
      }
      return null;
    case "vat":
      return <VATSection includeTax={formProps.formData.include_tax} taxRate={formProps.formData.tax_rate} onIncludeTaxChange={(v) => formProps.handleFieldChange("include_tax", v)} onTaxRateChange={(v) => formProps.handleFieldChange("tax_rate", v)} />;
    case "date":
      // Rozróżniamy różne daty po nazwie pola
      if (field.name === "business_timestamp") {
        return <FormField label={field.label} error={formProps.errors.business_timestamp} required={field.required}><DateInput value={formProps.formData.business_timestamp} onChange={(v) => formProps.handleFieldChange("business_timestamp", v)} /></FormField>;
      } else if (field.name === "transfer_date") {
        return <FormField label={field.label} error={formProps.errors.transfer_date} required={field.required}><DateInput value={formProps.formData.transfer_date || ''} onChange={(v) => formProps.handleFieldChange("transfer_date", v)} /></FormField>;
      } else if (field.name === "sales_date") {
        return <FormField label={field.label} error={formProps.errors.sales_date} required={field.required}><DateInput value={formProps.formData.sales_date || ''} onChange={(v) => formProps.handleFieldChange("sales_date", v)} /></FormField>;
      }
      return null;
    default:
      return null;
  }
} 