# Etap 1: Przygotowanie i analiza - Dokumentacja

## **1. Audyt obecnego kodu**

### **1.1 Struktura stanu w hooku**

**Lokalizacja:** `src/forms/simple-transaction-form/hooks/useSimpleTransactionForm.ts`

**Obecna architektura stanu:**
```typescript
// Stan "wspólny" - te same pola dla wszystkich typów transakcji
const [shared, setShared] = useState<SharedFields>({
  gross_amount: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
});

// Stan "prywatny" - różne pola dla różnych typów transakcji
const [perType, setPerType] = useState<PerTypeStore>({
  simple_expense: defaultPrivateForType("simple_expense"),
  simple_income: defaultPrivateForType("simple_income"),
  simple_transfer: defaultPrivateForType("simple_transfer"),
  payment_broker_transfer: defaultPrivateForType("payment_broker_transfer"),
});

// Aktualnie wybrany typ transakcji
const [transactionType, setTransactionType] = useState<string>("simple_expense");
```

**Problemy zidentyfikowane:**
1. **"Shared" nie są naprawdę shared** - broker_transfer nie używa `gross_amount`, `business_timestamp`
2. **Skomplikowana logika łączenia** - `mergedFields` łączy 3 różne źródła danych
3. **Reset wpływa na wszystko** - resetuje wszystkie plastry na raz

### **1.2 Analiza typów TypeScript**

**Lokalizacja:** `src/forms/simple-transaction-form/utils/validation.ts`

**Główny interfejs:**
```typescript
export interface SimpleTransactionFormShape {
  // Pola wspólne (ale nie dla broker_transfer!)
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;           // ❌ NIE używane w broker_transfer
  business_timestamp: string;     // ❌ NIE używane w broker_transfer
  transaction_type: string;
  
  // Pola opcjonalne dla expense/income
  custom_category_group?: string;
  custom_category?: string;
  include_tax: boolean;
  tax_rate: number;
  business_reference?: string;
  item?: string;
  note?: string;
  to_account?: string;
  
  // Pola specyficzne dla broker_transfer
  transfer_date?: string;         // ✅ TYLKO dla broker_transfer
  sales_date?: string;           // ✅ TYLKO dla broker_transfer
  paynow_transfer?: string;      // ✅ TYLKO dla broker_transfer
  autopay_transfer?: string;     // ✅ TYLKO dla broker_transfer
}
```

**Wnioski:**
- Interfejs jest **"wszystko w jednym"** - zawiera pola dla wszystkich typów
- Broker_transfer ma **zupełnie inne pola** niż pozostałe typy
- **Brak separacji** między różnymi typami transakcji

### **1.3 Analiza zależności i efektów**

**Lokalizacja:** `src/forms/simple-transaction-form/hooks/useSimpleTransactionForm.ts`

**useEffect zależne od transactionType:**

1. **Sales data cache:**
```typescript
useEffect(() => {
  const date = mergedFields.sales_date;
  if (mergedFields.transaction_type !== "payment_broker_transfer" || !date) return;
  // ... fetch sales data
}, [mergedFields.transaction_type, mergedFields.sales_date, salesCache]);
```

2. **Auto-adjust dates:**
```typescript
useEffect(() => {
  if (transactionType !== "payment_broker_transfer") return;
  // ... auto-adjust logic
}, [transactionType, mergedFields.transfer_date, mergedFields.sales_date, setPrivateForCurrent]);
```

**Wnioski:**
- Efekty są **specyficzne dla broker_transfer**
- Zależności od `mergedFields` i `transactionType`
- **Potrzebne będą nowe zależności** w nowej architekturze

### **1.4 Analiza komponentu**

**Lokalizacja:** `src/components/SimpleTransactionForm.tsx`

**Jak komponent używa hooka:**
```typescript
const {
  fields: formData,           // ← mergedFields z hooka
  errors,
  isSubmitting,
  submit,
  reset: resetFormFromHook,   // ← funkcja reset z hooka
  handlers: { handleFieldChange, handleAmountChange, handleBooleanChange, handleNumberChange },
  dataSources: { accounts, categoryGroups, availableCategories, salesData, salesLoading },
} = useSimpleTransactionForm();
```

**Renderowanie warunkowe:**
```typescript
const isSimpleTransfer = formData.transaction_type === "simple_transfer";
const isBrokerTransfer = formData.transaction_type === "payment_broker_transfer";
const isTransfer = isSimpleTransfer || isBrokerTransfer;

// Warunkowe renderowanie pól
{!isBrokerTransfer && (
  // Pola account, category_group, category
)}

{isBrokerTransfer && (
  // Pola paynow_transfer, autopay_transfer, transfer_date, sales_date
)}
```

**Wnioski:**
- Komponent używa `formData` (mergedFields) do renderowania
- **Dużo logiki warunkowej** na podstawie `transaction_type`
- **Potrzebne będzie nowe API** z hooka

### **1.5 Analiza funkcji walidacji**

**Lokalizacja:** `src/forms/simple-transaction-form/utils/validation.ts`

**Obecna funkcja walidacji:**
```typescript
export function validateSimpleTransactionForm(fields: SimpleTransactionFormShape): Record<string, string>
```

**Logika walidacji:**
- **Expense/Income:** waliduje `gross_amount`, `category_group`, `category`
- **Simple Transfer:** waliduje `to_account`, `account`
- **Broker Transfer:** waliduje `paynow_transfer`, `autopay_transfer`, `transfer_date`, `sales_date`

**Wnioski:**
- **Jedna funkcja** dla wszystkich typów
- **Dużo warunków** `if (fields.transaction_type === "...")`
- **Potrzebne będą osobne funkcje** walidacji per typ

### **1.6 Analiza funkcji payload**

**Lokalizacja:** `src/forms/simple-transaction-form/utils/payload.ts`

**Obecna funkcja payload:**
```typescript
export function buildSimpleTransactionPayload(form: SimpleTransactionFormShape): SimpleTransactionPayload
// ❌ Myliąca nazwa - buduje payload dla WSZYSTKICH typów transakcji!
```

**Logika budowania payload:**
- **Expense/Income:** `gross_amount`, `category_group`, `category`
- **Simple Transfer:** `to_account`, `gross_amount`
- **Broker Transfer:** `paynow_transfer`, `autopay_transfer`, `transfer_date`, `sales_date`

**Wnioski:**
- **Jedna funkcja** dla wszystkich typów (ale myliąca nazwa!)
- **Dużo warunków** `if (form.transaction_type === "...")`
- **Opcje:**
  - **Opcja 1:** Zmienić nazwę na `buildTransactionPayload` (zalecane)
  - **Opcja 2:** Podzielić na osobne funkcje per typ

## **2. Analiza zależności**

### **2.1 Zależności od transactionType**

1. **W hooku:**
   - `mergedFields` - łączenie danych
   - `setPrivateForCurrent` - aktualizacja plastra
   - `handleFieldChange` - logika przełączania
   - `useEffect` - sales data i auto-adjust

2. **W komponencie:**
   - Renderowanie warunkowe pól
   - Logika `isSimpleTransfer`, `isBrokerTransfer`
   - `lastSubmitted` - przechowywanie ostatnio wysłanych danych

3. **W walidacji:**
   - Różne reguły walidacji per typ
   - Warunki `if (fields.transaction_type === "...")`

4. **W payload:**
   - Różne struktury payload per typ
   - Warunki `if (form.transaction_type === "...")`

### **2.2 Zależności od mergedFields**

1. **W hooku:**
   - `availableCategories` - kategorie na podstawie aktualnych danych
   - `currentSales` - sales data dla broker transfer
   - `useEffect` - sales data fetch

2. **W komponencie:**
   - Wszystkie pola formularza
   - `lastSubmitted` - dane do wyświetlenia po submit

### **2.3 Cache i efekty**

1. **Sales data cache:**
   - Zależność od `mergedFields.sales_date`
   - Fetch tylko dla broker_transfer
   - Cache per data

2. **Auto-adjust dates:**
   - Zależność od `mergedFields.transfer_date` i `mergedFields.sales_date`
   - Działanie tylko dla broker_transfer

## **3. Przygotowanie typów TypeScript**

### **3.1 Nowe interfejsy dla każdego widoku**

**Planowane interfejsy:**

```typescript
// Simple Expense i Simple Income mają podobną strukturę
interface SimpleExpenseState {
  gross_amount: string;
  account: string;
  category_group: string;
  category: string;
  business_reference: string;
  item: string;
  note: string;
  business_timestamp: string;
  include_tax: boolean;
  tax_rate: number;
  custom_category_group: string;
  custom_category: string;
}

interface SimpleIncomeState {
  // Taki sam jak SimpleExpenseState
}

// Simple Transfer ma prostszą strukturę
interface SimpleTransferState {
  account: string;
  to_account: string;
  business_reference: string;
  item: string;
  note: string;
  business_timestamp: string;
}

// Payment Broker Transfer ma zupełnie inną strukturę
interface PaymentBrokerTransferState {
  paynow_transfer: string;
  autopay_transfer: string;
  transfer_date: string;
  sales_date: string;
  business_reference: string;
  item: string;
  note: string;
}

// Typ dla aktualnego widoku
type ViewType = "simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer";
```

### **3.2 Nowe interfejsy dla funkcji**

```typescript
// Nowe interfejsy dla hooka
interface UseSimpleTransactionFormReturn {
  currentView: ViewType;
  currentViewData: SimpleExpenseState | SimpleIncomeState | SimpleTransferState | PaymentBrokerTransferState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submit: () => Promise<boolean>;
  resetCurrentView: () => void;
  switchView: (view: ViewType) => void;
  handlers: {
    handleFieldChange: (field: string, value: string) => void;
    handleAmountChange: (value: string) => void;
    handleBooleanChange: (field: string, value: boolean) => void;
    handleNumberChange: (field: string, value: number) => void;
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
```

## **4. Podsumowanie analizy**

### **4.1 Co trzeba zmienić**

1. **Stan w hooku:**
   - Usunąć `shared`, `perType`, `transactionType`
   - Dodać `currentView` i stany dla każdego widoku
   - Zastąpić `mergedFields` funkcją `getCurrentViewData()`

2. **Funkcje kontrolne:**
   - Nowa `resetCurrentView()` - resetuje tylko aktualny widok
   - Nowa `switchView()` - przełącza widok bez resetu
   - Aktualizacja `submit()` - używa nowych funkcji

3. **Walidacja:**
   - Osobne funkcje walidacji per typ
   - `validateSimpleExpenseForm()`, `validateSimpleIncomeForm()`, itd.

4. **Payload:**
   - Osobne funkcje payload per typ
   - `buildSimpleExpensePayload()`, `buildSimpleIncomePayload()`, itd.

5. **Komponent:**
   - Użycie `currentView` zamiast `transaction_type`
   - Użycie `currentViewData` zamiast `formData`
   - Aktualizacja renderowania warunkowego

### **4.2 Potencjalne problemy**

1. **Duża zmiana** - refaktoryzacja dotyka wielu plików
2. **Testowanie** - potrzeba przetestowania wszystkich scenariuszy
3. **Regresje** - ryzyko wprowadzenia błędów w istniejącej funkcjonalności
4. **Cache sales data** - może wymagać specjalnej uwagi
5. **Auto-adjust dates** - może wymagać nowej logiki

### **4.3 Następne kroki**

1. **Etap 2:** Refaktoryzacja stanu w hooku
2. **Etap 3:** Refaktoryzacja funkcji kontrolnych
3. **Etap 4:** Refaktoryzacja komponentu
4. **Etap 5:** Refaktoryzacja walidacji
5. **Etap 6:** Refaktoryzacja payload building
6. **Etap 7:** Refaktoryzacja efektów i cache
7. **Etap 8:** Testowanie i debugowanie
8. **Etap 9:** Czyszczenie i optymalizacja

## **5. Ważne koncepcje React do zrozumienia**

### **5.1 useState**
- Hook do zarządzania stanem w komponencie
- Zwraca tablicę: `[stan, funkcjaDoZmianyStanu]`
- Gdy stan się zmienia, komponent się przerenderowuje

### **5.2 useMemo**
- Hook do memoizacji (zapamiętywania) wartości
- Przydatny gdy obliczenia są kosztowne
- Rekompiluje się tylko gdy zależności się zmieniają

### **5.3 useCallback**
- Hook do memoizacji funkcji
- Przydatny gdy funkcja jest przekazywana jako prop
- Rekompiluje się tylko gdy zależności się zmieniają

### **5.4 useEffect**
- Hook do efektów ubocznych (side effects)
- Uruchamia się po renderowaniu komponentu
- Może mieć zależności - uruchamia się gdy zależności się zmieniają

### **5.5 Custom Hook**
- Funkcja zaczynająca się od "use"
- Może używać innych hooków React
- Pozwala na współdzielenie logiki między komponentami

### **5.6 TypeScript w React**
- Dodaje typowanie do JavaScript
- Pomaga w wykrywaniu błędów na etapie kompilacji
- Poprawia autouzupełnianie w IDE 