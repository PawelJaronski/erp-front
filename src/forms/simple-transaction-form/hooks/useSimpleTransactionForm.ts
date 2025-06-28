import { useState, useMemo, useCallback } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { computeAvailableCategories } from "../utils/availableCategories";
import { SimpleTransactionFormShape, validateSimpleTransactionForm } from "../utils/validation";
import { syncCategory } from "../utils/syncCategory";
import { buildSimpleTransactionPayload } from "../utils/payload";

export interface UseSimpleTransactionFormReturn {
  fields: SimpleTransactionFormShape;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submit: () => Promise<boolean>;
  reset: () => void;
  handlers: {
    handleFieldChange: (field: keyof SimpleTransactionFormShape, value: string) => void;
    handleAmountChange: (value: string) => void;
    handleBooleanChange: (field: keyof SimpleTransactionFormShape, value: boolean) => void;
    handleNumberChange: (field: keyof SimpleTransactionFormShape, value: number) => void;
  };
  dataSources: {
    accounts: typeof accounts;
    categoryGroups: typeof categoryGroups;
    categories: typeof categoriesData;
    availableCategories: { value: string; group: string }[];
  };
}

const defaultDate = new Date().toISOString().split("T")[0];

export function useSimpleTransactionForm(): UseSimpleTransactionFormReturn {
  const [fields, setFields] = useState<SimpleTransactionFormShape>({
    account: "mbank_osobiste",
    category_group: "opex",
    category: "",
    gross_amount: "",
    business_timestamp: defaultDate,
    transaction_type: "simple_expense",
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
    (field: keyof SimpleTransactionFormShape, value: string) => {
      setFields((prev: SimpleTransactionFormShape) => {
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

  const handleBooleanChange = useCallback((field: keyof SimpleTransactionFormShape, value: boolean) => {
    setFields((prev: SimpleTransactionFormShape) => ({ ...prev, [field]: value }));
  }, []);

  const handleNumberChange = (field: keyof SimpleTransactionFormShape, value: number) => {
    setFields((prev: SimpleTransactionFormShape) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setFields({
      transaction_type: "simple_expense",
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
    const validationErrors = validateSimpleTransactionForm(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = buildSimpleTransactionPayload(fields);
      const res = await fetch("https://jaronski-erp.railway.app/add-transaction", {
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