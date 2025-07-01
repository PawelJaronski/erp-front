import { useState, useMemo, useCallback } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { computeAvailableCategories } from "../utils/availableCategories";
import { SimpleTransactionFormShape, validateSimpleTransactionForm } from "../utils/validation";
import { syncCategory, FieldKey } from "../utils/syncCategory";
import { buildSimpleTransactionPayload } from "../utils/payload";
import { getCounterAccount } from "../utils/transferAccounts";

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

// Shared fields independent of transaction type
const sharedKeys: (keyof SimpleTransactionFormShape)[] = [
  "gross_amount",
  "business_reference",
  "item",
  "note",
  "business_timestamp",
];

type SharedFields = Pick<
  SimpleTransactionFormShape,
  "gross_amount" | "business_reference" | "item" | "note" | "business_timestamp"
>;

type PrivateFields = Omit<SimpleTransactionFormShape, keyof SharedFields | "transaction_type">;

type PerTypeStore = Record<string, Partial<PrivateFields>>;

function defaultPrivateForType(type: string): Partial<PrivateFields> {
  if (type === "simple_transfer") {
    return {
      account: "mbank_firmowe",
      to_account: "mbank_osobiste",
      category_group: "",
      category: "",
    };
  }
  return {
    account: "mbank_osobiste",
    category_group: "opex",
    category: "",
    custom_category_group: "",
    custom_category: "",
    include_tax: false,
    tax_rate: 23,
  };
}

export function useSimpleTransactionForm(): UseSimpleTransactionFormReturn {
  /* --------------------------------------------------------
   *  State – shared and per-type private slices
   * ------------------------------------------------------*/
  const [shared, setShared] = useState<SharedFields>({
    gross_amount: "",
    business_reference: "",
    item: "",
    note: "",
    business_timestamp: defaultDate,
  });

  const [perType, setPerType] = useState<PerTypeStore>({
    simple_expense: defaultPrivateForType("simple_expense"),
    simple_income: defaultPrivateForType("simple_income"),
    simple_transfer: defaultPrivateForType("simple_transfer"),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active transaction type
  const [transactionType, setTransactionType] = useState<string>("simple_expense");

  /* --------------------------------------------------------
   *  Derived helpers
   * ------------------------------------------------------*/
  const mergedFields: SimpleTransactionFormShape = useMemo(() => {
    return {
      transaction_type: transactionType,
      ...shared,
      ...perType[transactionType],
    } as SimpleTransactionFormShape;
  }, [shared, perType, transactionType]);

  const availableCategories = useMemo(
    () => computeAvailableCategories(mergedFields),
    [mergedFields]
  );

  /* --------------------------------------------------------
   *  Internal mutators
   * ------------------------------------------------------*/
  const setPrivateForCurrent = (update: Partial<PrivateFields>) => {
    setPerType((prev) => ({
      ...prev,
      [transactionType]: { ...prev[transactionType], ...update },
    }));
  };

  const handleFieldChange = useCallback(
    (field: keyof SimpleTransactionFormShape, value: string) => {
      // Special handling – switching view
      if (field === "transaction_type") {
        const newType = value;
        // Lazily initialise defaults only the first time we enter given type
        setPerType((prev) => {
          if (prev[newType]) return prev;
          return { ...prev, [newType]: defaultPrivateForType(newType) };
        });
        setTransactionType(newType);
        return;
      }

      // Shared slice update
      if (sharedKeys.includes(field)) {
        setShared((prev) => ({ ...prev, [field]: value } as SharedFields));
      } else {
        // Private slice update with extra rules for transfers & category sync
        let nextPrivate = {
          ...((perType[transactionType] || {}) as PrivateFields),
          [field]: value,
        } as PrivateFields;

        // Keep accounts different when transfer
        if (transactionType === "simple_transfer") {
          if (field === "account" && value === nextPrivate.to_account) {
            nextPrivate.to_account = getCounterAccount(value);
          }
          if (field === "to_account" && value === nextPrivate.account) {
            nextPrivate.account = getCounterAccount(value);
          }
        }

        // Sync category ↔ group (works on merged tmp object)
        const tmpMerged = {
          ...shared,
          ...nextPrivate,
          transaction_type: transactionType,
        } as SimpleTransactionFormShape;

        const synced = syncCategory(
          tmpMerged,
          field as FieldKey,
          value,
          (cat) => categoriesData.find((c) => c.value === cat)?.group
        );

        // Extract back private slice after sync
        const newPrivate: Partial<PrivateFields> = {};
        (Object.keys(synced) as (keyof SimpleTransactionFormShape)[]).forEach((k) => {
          if (!sharedKeys.includes(k) && k !== "transaction_type") {
            // @ts-ignore – k in newPrivate by construction
            newPrivate[k] = synced[k];
          }
        });

        setPrivateForCurrent(newPrivate);
      }

      // Clear validation error for this field when user modifies it
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }
    },
    // We rely on transactionType & shared/perType through hooks setters, so deps safe
    [perType, shared, transactionType, errors]
  );

  const handleAmountChange = (value: string) => {
    const clean = value.replace(/[^0-9,.-]/g, "");
    handleFieldChange("gross_amount", clean);
  };

  const handleBooleanChange = useCallback(
    (field: keyof SimpleTransactionFormShape, value: boolean) => {
      if (sharedKeys.includes(field)) {
        setShared((prev) => ({ ...prev, [field]: value } as SharedFields));
      } else {
        setPrivateForCurrent({ [field]: value } as unknown as Partial<PrivateFields>);
      }
    },
    [transactionType]
  );

  const handleNumberChange = (field: keyof SimpleTransactionFormShape, value: number) => {
    if (sharedKeys.includes(field)) {
      // @ts-ignore
      setShared((prev) => ({ ...prev, [field]: value }));
    } else {
      setPrivateForCurrent({ [field]: value } as unknown as Partial<PrivateFields>);
    }
  };

  /* --------------------------------------------------------
   *  Control helpers – reset & submit
   * ------------------------------------------------------*/
  const reset = () => {
    setShared({
      gross_amount: "",
      business_reference: "",
      item: "",
      note: "",
      business_timestamp: defaultDate,
    });

    setPerType({
      simple_expense: defaultPrivateForType("simple_expense"),
      simple_income: defaultPrivateForType("simple_income"),
      simple_transfer: defaultPrivateForType("simple_transfer"),
    });

    setTransactionType("simple_expense");
    setErrors({});
  };

  const submit = async (): Promise<boolean> => {
    const validationErrors = validateSimpleTransactionForm(mergedFields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = buildSimpleTransactionPayload(mergedFields);
      const res = await fetch(
        "https://jaronski-erp-backend-production.up.railway.app/add-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Server error");

      // success – reset but keep current account selection for convenience
      reset();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------------------------------------------
   *  Public API (hook return)
   * ------------------------------------------------------*/
  return {
    fields: mergedFields,
    errors,
    isSubmitting,
    submit,
    reset,
    handlers: {
      handleFieldChange,
      handleAmountChange,
      handleBooleanChange,
      handleNumberChange,
    },
    dataSources: {
      accounts,
      categoryGroups,
      categories: categoriesData,
      availableCategories,
    },
  };
} 