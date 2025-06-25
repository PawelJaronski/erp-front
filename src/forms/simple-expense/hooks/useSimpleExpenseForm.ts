import { useState, useMemo, useCallback } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { ExpenseFormShape, validateExpenseForm } from "../utils/validation";
import { syncCategory } from "../utils/syncCategory";
import { buildExpensePayload } from "../utils/payload";

export interface UseSimpleExpenseReturn {
  fields: ExpenseFormShape;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submit: () => Promise<void>;
  reset: () => void;
  handlers: {
    handleFieldChange: (field: keyof ExpenseFormShape, value: string) => void;
    handleAmountChange: (value: string) => void;
  };
  dataSources: {
    accounts: typeof accounts;
    categoryGroups: typeof categoryGroups;
    categories: typeof categoriesData;
    availableCategories: { value: string; group: string }[];
  };
}

const defaultDate = new Date().toISOString().split("T")[0];

export function useSimpleExpenseForm(): UseSimpleExpenseReturn {
  const [fields, setFields] = useState<ExpenseFormShape>({
    account: "mbank_osobiste",
    category_group: "opex",
    category: "",
    gross_amount: "",
    business_timestamp: defaultDate,
    custom_category_group: "",
    custom_category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = useMemo(() => {
    const base = [...categoriesData, { value: "other", group: "other" }];
    if (fields.category_group && fields.category_group !== "other") {
      return [
        ...categoriesData.filter((c) => c.group === fields.category_group),
        { value: "other", group: fields.category_group },
      ];
    }
    return base;
  }, [fields.category_group]);

  const handleFieldChange = useCallback(
    (field: keyof ExpenseFormShape, value: string) => {
      setFields((prev) => {
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

  const reset = () => {
    setFields({
      account: "mbank_osobiste",
      category_group: "opex",
      category: "",
      gross_amount: "",
      business_timestamp: defaultDate,
      custom_category_group: "",
      custom_category: "",
    });
    setErrors({});
  };

  const submit = async () => {
    const validationErrors = validateExpenseForm(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;

    setIsSubmitting(true);
    try {
      const payload = buildExpensePayload(fields);
      const res = await fetch("https://erp.jaronski.com/add-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      // success – reset but keep account selection for convenience
      reset();
    } catch (e) {
      console.error(e);
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
    handlers: { handleFieldChange, handleAmountChange },
    dataSources: {
      accounts,
      categoryGroups,
      categories: categoriesData,
      availableCategories,
    },
  };
} 