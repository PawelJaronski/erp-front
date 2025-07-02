import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { computeAvailableCategories } from "../utils/availableCategories";
import { SimpleTransactionFormShape, validateSimpleTransactionForm } from "../utils/validation";
import { syncCategory, FieldKey } from "../utils/syncCategory";
import { buildSimpleTransactionPayload } from "../utils/payload";
import { fetchSalesForDate, SalesData } from "../utils/sales";

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
    salesData?: SalesData | null;
    salesLoading?: boolean;
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
  } else if (type === "payment_broker_transfer") {
    return {
      account: "paynow",
      to_account: "mbank_firmowe",
      category_group: "",
      category: "",
      transfer_date: defaultDate,
      sales_date: (() => {
        const d = new Date(defaultDate);
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      })(),
      paynow_transfer: "",
      autopay_transfer: "",
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
    payment_broker_transfer: defaultPrivateForType("payment_broker_transfer"),
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
   *  Phase 2 – sales lookup cache & loading
   * ------------------------------------------------------*/
  const [salesCache, setSalesCache] = useState<Record<string, SalesData>>({});
  const [salesLoading, setSalesLoading] = useState(false);

  const currentSales: SalesData | null = useMemo(() => {
    if (mergedFields.transaction_type !== "payment_broker_transfer") return null;
    return salesCache[mergedFields.sales_date ?? ""] || null;
  }, [mergedFields.transaction_type, mergedFields.sales_date, salesCache]);

  // Automatically fetch sales when sales_date changes for broker transfer
  useEffect(() => {
    const date = mergedFields.sales_date;
    if (mergedFields.transaction_type !== "payment_broker_transfer" || !date) return;
    if (salesCache[date]) return; // already cached

    let cancelled = false;
    setSalesLoading(true);
    fetchSalesForDate(date)
      .then((data) => {
        if (cancelled) return;
        setSalesCache((prev) => ({ ...prev, [date]: data }));
      })
      .catch((err) => {
        console.error("Sales fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setSalesLoading(false);
      });

    return () => {
      cancelled = true;
      // Prevent stale loading state when request is abandoned due to date change
      setSalesLoading(false);
    };
  }, [mergedFields.transaction_type, mergedFields.sales_date, salesCache]);

  /* --------------------------------------------------------
   *  Phase 3 – auto-adjust transfer/sales dates (broker transfer)
   * ------------------------------------------------------*/

  // Remember which of the two date fields user modified last
  const lastDateChangedRef = useRef<"transfer_date" | "sales_date" | null>(null);

  /* --------------------------------------------------------
   *  Internal mutators
   * ------------------------------------------------------*/
  const setPrivateForCurrent = useCallback(
    (update: Partial<PrivateFields>) => {
      setPerType((prev) => ({
        ...prev,
        [transactionType]: { ...prev[transactionType], ...update },
      }));
    },
    [transactionType]
  );

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
        const nextPrivate = {
          ...((perType[transactionType] || {}) as PrivateFields),
          [field]: value,
        } as PrivateFields;

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
            // @ts-expect-error – k in newPrivate by construction
            newPrivate[k] = synced[k];
          }
        });

        setPrivateForCurrent(newPrivate);
      }

      // Clear validation error for this field when user modifies it
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }

      // Track which date was modified last (for auto-adjust logic)
      if (field === "transfer_date" || field === "sales_date") {
        lastDateChangedRef.current = field;
      }
    },
    [setPrivateForCurrent, errors]
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
    [setPrivateForCurrent]
  );

  const handleNumberChange = (field: keyof SimpleTransactionFormShape, value: number) => {
    // Currently only tax_rate uses number path and belongs to private slice
    setPrivateForCurrent({ [field]: value } as unknown as Partial<PrivateFields>);
  };

  /* --------------------------------------------------------
   *  Auto-adjust date gap effect – ensures transfer_date ≥ sales_date + 1d
   * ------------------------------------------------------*/
  useEffect(() => {
    if (transactionType !== "payment_broker_transfer") return;

    const T = mergedFields.transfer_date;
    const S = mergedFields.sales_date;
    if (!T || !S) return; // potrzebujemy obu dat

    const toIso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const addDays = (dateStr: string, delta: number) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const utc = Date.UTC(y, m - 1, d) + delta * 86400000;
      const nd = new Date(utc);
      return toIso(nd.getUTCFullYear(), nd.getUTCMonth(), nd.getUTCDate());
    };

    const parseUTC = (dateStr: string) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };

    const gapDays = (parseUTC(T) - parseUTC(S)) / 86400000;
    if (gapDays >= 1) return; // reguła spełniona – brak zmian

    // reguła złamana (S ≥ T) – cofamy sales_date na dzień przed transfer_date
    const newSales = addDays(T, -1);
    if (newSales !== S) setPrivateForCurrent({ sales_date: newSales });
  }, [transactionType, mergedFields.transfer_date, mergedFields.sales_date, setPrivateForCurrent]);

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
      payment_broker_transfer: defaultPrivateForType("payment_broker_transfer"),
    });

    setTransactionType("simple_expense");
    setErrors({});
  };

  const submit = async (): Promise<boolean> => {
    let validationErrors = validateSimpleTransactionForm(mergedFields);

    // Additional Phase 3 rule: ensure paynow+autopay ≤ sales total for broker transfers
    if (mergedFields.transaction_type === "payment_broker_transfer") {
      const sales = currentSales?.total ?? null;

      const toNum = (v?: string) => {
        if (!v) return 0;
        const cleaned = v.replace(/\s/g, "").replace(/,/g, ".");
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
      };

      const transfers = toNum(mergedFields.paynow_transfer) + toNum(mergedFields.autopay_transfer);

      if (sales !== null && transfers > sales) {
        validationErrors = {
          ...validationErrors,
          paynow_transfer: "Łączna kwota przelewów nie może przekraczać sprzedaży",
        };
      }
    }

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

      if (!res.ok) {
        let backendMsg = "Unknown error";
        try {
          const errJson = await res.json();
          backendMsg = JSON.stringify(errJson);
        } catch (_) {
          const text = await res.text();
          backendMsg = text;
        }
        throw new Error(`Backend error ${res.status}: ${backendMsg}`);
      }

      // success – reset but keep current account selection for convenience
      reset();
      return true;
    } catch (e: unknown) {
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
      salesData: currentSales,
      salesLoading,
    },
  };
} 