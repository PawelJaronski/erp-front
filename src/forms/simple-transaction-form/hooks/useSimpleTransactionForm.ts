  import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { categoriesData, accounts, categoryGroups } from "../utils/staticData";
import { computeAvailableCategories } from "../utils/availableCategories";
import { SimpleTransactionFormShape, validateSimpleTransactionForm } from "../utils/validation";
import { syncCategory, FieldKey } from "../utils/syncCategory";
import { buildSimpleTransactionPayload } from "../utils/payload";
import { fetchSalesForDate, SalesData } from "../utils/sales";

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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

// NOWE STAŁE
const defaultSimpleExpenseState = {
  gross_amount: "",
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
  tax_rate: 23,
  include_tax: false,
  custom_category_group: "",
  custom_category: "",
};

const defaultSimpleIncomeState = {
  gross_amount: "",
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
  tax_rate: 23,
  include_tax: false,
  custom_category_group: "",
  custom_category: "",
};

const defaultSimpleTransferState = {
  account: "mbank_firmowe",
  to_account: "mbank_osobiste",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
};

const defaultPaymentBrokerTransferState = {
  paynow_transfer: "",
  autopay_transfer: "",
  transfer_date: defaultDate,
  sales_date: yesterday, 
  business_reference: "",
  item: "",
  note: "",
};

export function useSimpleTransactionForm(): UseSimpleTransactionFormReturn {
  const [currentView, setCurrentView] = useState<"simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer">("simple_expense");

  const [simpleExpenseState, setSimpleExpenseState] = useState(defaultSimpleExpenseState);
  const [simpleIncomeState, setSimpleIncomeState] = useState(defaultSimpleIncomeState);
  const [simpleTransferState, setSimpleTransferState] = useState(defaultSimpleTransferState);
  const [paymentBrokerTransferState, setPaymentBrokerTransferState] = useState(defaultPaymentBrokerTransferState);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentViewData = useCallback(() => {
    switch (currentView) {
      case "simple_expense": 
        return simpleExpenseState;
      case "simple_income": 
        return simpleIncomeState;
      case "simple_transfer": 
        return simpleTransferState;
      case "payment_broker_transfer": 
        return paymentBrokerTransferState;
      default:
        return simpleExpenseState;
    }
  }, [currentView, simpleExpenseState, simpleIncomeState, simpleTransferState, paymentBrokerTransferState]);

  const getCurrentViewSetter = useCallback(() => {
    switch (currentView) {
      case "simple_expense": 
        return setSimpleExpenseState;
      case "simple_income": 
        return setSimpleIncomeState;
      case "simple_transfer": 
        return setSimpleTransferState;
      case "payment_broker_transfer": 
        return setPaymentBrokerTransferState;
      default:
        return setSimpleExpenseState;
    }
  }, [currentView]);

  const updateCurrentViewField = useCallback((field: string, value: string | number | boolean) => {
    const setter = getCurrentViewSetter();
    setter((prev: any) => ({ ...prev, [field]: value }));
  }, [getCurrentViewSetter]);

  const mergedFields: SimpleTransactionFormShape = useMemo(() => {
    const currentData = getCurrentViewData();
    return {
      transaction_type: currentView,
      ...currentData,
    } as SimpleTransactionFormShape;
  }, [getCurrentViewData, currentView]);

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

  const handleFieldChange = useCallback(
    (field: keyof SimpleTransactionFormShape, value: string) => {
      // Special handling – switching view
      if (field === "transaction_type") {
        setCurrentView(value as any);
        return;
      }
      updateCurrentViewField(field, value);
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }

      if (field === "transfer_date" || field === "sales_date") {
        lastDateChangedRef.current = field;
      }
    }, [updateCurrentViewField, errors]
  );
  const handleAmountChange = (value: string) => {
    const clean = value.replace(/[^0-9,.-]/g, "");
    updateCurrentViewField("gross_amount", clean);
  };

  const handleBooleanChange = useCallback(
    (field: keyof SimpleTransactionFormShape, value: boolean) => {
      updateCurrentViewField(field, value);
    }, [updateCurrentViewField]
  );

  const handleNumberChange = (field: keyof SimpleTransactionFormShape, value: number) => {
    updateCurrentViewField(field, value);
  };

  /* --------------------------------------------------------
   *  Auto-adjust date gap effect – ensures transfer_date ≥ sales_date + 1d
   * ------------------------------------------------------*/
  useEffect(() => {
    if (currentView !== "payment_broker_transfer") return;
  
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
    if (newSales !== S) updateCurrentViewField("sales_date", newSales);
  }, [currentView, mergedFields.transfer_date, mergedFields.sales_date, updateCurrentViewField]);


  /* --------------------------------------------------------
   *  Control helpers – reset & submit
   * ------------------------------------------------------*/
  const reset = () => {
    setSimpleExpenseState(defaultSimpleExpenseState);
    setSimpleIncomeState(defaultSimpleIncomeState);
    setSimpleTransferState(defaultSimpleTransferState);
    setPaymentBrokerTransferState(defaultPaymentBrokerTransferState);
    setCurrentView("simple_expense");
    setErrors({});
  };

  const submit = async (): Promise<boolean> => {
    console.log('--- SUBMIT start ---', mergedFields);

    let validationErrors = validateSimpleTransactionForm(mergedFields);
    console.log('Validation errors:', validationErrors);

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
      console.log('Payload wysyłany do backendu:', payload);
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
        } catch {
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