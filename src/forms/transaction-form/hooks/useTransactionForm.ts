import { useState, useMemo, useCallback } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { computeAvailableCategories } from "../utils/availableCategories";
import { TransactionFormShape, validateTransactionForm } from "../utils/validation";
import { syncCategory } from "../utils/syncCategory";
import { buildTransactionPayload } from "../utils/payload";

export interface UseTransactionFormReturn {
  fields: TransactionFormShape;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submit: () => Promise<boolean>;
  reset: () => void;
  handlers: {
    handleFieldChange: (field: keyof TransactionFormShape, value: string) => void;
    handleAmountChange: (value: string) => void;
    handleBooleanChange: (field: keyof TransactionFormShape, value: boolean) => void;
    handleNumberChange: (field: keyof TransactionFormShape, value: number) => void;
  };
  dataSources: {
    accounts: typeof accounts;
    categoryGroups: typeof categoryGroups;
    categories: typeof categoriesData;
    availableCategories: { value: string; group: string }[];
  };
}

const defaultDate = new Date().toISOString().split("T")[0];

export function useTransactionForm(): UseTransactionFormReturn {
  const [fields, setFields] = useState<TransactionFormShape>({
    account: "mbank_osobiste",
    category_group: "opex",
    category: "",
    gross_amount: "",
    business_timestamp: defaultDate,
    transaction_type: "expense",
    custom_category_group: "",
    custom_category: "",
    include_tax: false,
    tax_rate: 23,
    business_reference: "",
    item: "",
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = useMemo(
    () => computeAvailableCategories(fields),
    [fields.category_group, fields.category]
  );

  const handleFieldChange = useCallback(
    (field: keyof TransactionFormShape, value: string) => {
      setFields((prev: TransactionFormShape) => {
        const synced = syncCategory(prev, field, value, (cat) => {
          const found = categoriesData.find((c) => c.value === cat);
          return found?.group;
        });
        return synced;
      });

      // clear error for that field
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }
    },
    [errors]
  );

  const handleAmountChange = (value: string) => {
    const clean = value.replace(/[^0-9,.-]/g, "");
    handleFieldChange("gross_amount", clean);
  };

  const handleBooleanChange = useCallback((field: keyof TransactionFormShape, value: boolean) => {
    setFields((prev: TransactionFormShape) => ({ ...prev, [field]: value }));
  }, []);

  const handleNumberChange = (field: keyof TransactionFormShape, value: number) => {
    setFields((prev: TransactionFormShape) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setFields({
      transaction_type: "expense",
      account: "mbank_osobiste",
      category_group: "opex",
      category: "",
      gross_amount: "",
      business_timestamp: defaultDate,
      custom_category_group: "",
      custom_category: "",
      include_tax: false,
      tax_rate: 23,
      business_reference: "",
      item: "",
      note: "",
    });
    setErrors({});
  };

  const submit = async (): Promise<boolean> => {
    const validationErrors = validateTransactionForm(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = buildTransactionPayload(fields);
      const res = await fetch("https://erp.jaronski.com/add-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      // success – reset but keep account selection for convenience
      reset();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fields,
    errors,
    isSubmitting,
    submit,
    reset,
    handlers: { handleFieldChange, handleAmountChange, handleBooleanChange, handleNumberChange },
    dataSources: {
      accounts,
      categoryGroups,
      categories: categoriesData,
      availableCategories,
    },
  };
} 