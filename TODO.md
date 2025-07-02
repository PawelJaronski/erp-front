# Refaktoryzacja architektury formularza - Plan krok po kroku

## **Cel refaktoryzacji**

Zastąpienie obecnej skomplikowanej architektury `shared` + `perType` prostszą, bardziej intuicyjną architekturą z **niezależnymi widokami**. Każdy widok (expense, income, transfer, broker_transfer) będzie miał swój własny, niezależny stan.

## **Problemy obecnej architektury**

1. **"Shared" nie są naprawdę shared** - broker_transfer ma zupełnie inne pola
2. **Splątanie widoków** - reset jednego wpływa na inne
3. **Dziwaczny reset** - zawsze przełącza na expense zamiast resetować aktualny widok
4. **Nadmierna komplikacja** - skomplikowana logika łączenia stanów

## **Nowa architektura**

### **Struktura stanu**
```typescript
// Zamiast: shared + perType + transactionType
// Będzie: niezależne stany dla każdego widoku

const [currentView, setCurrentView] = useState<"simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer">("simple_expense");

const [simpleExpenseState, setSimpleExpenseState] = useState({
  gross_amount: "",
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
  include_tax: false,
  tax_rate: 23,
  custom_category_group: "",
  custom_category: "",
});

const [simpleIncomeState, setSimpleIncomeState] = useState({
  gross_amount: "",
  account: "mbank_osobiste", 
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
  include_tax: false,
  tax_rate: 23,
  custom_category_group: "",
  custom_category: "",
});

const [simpleTransferState, setSimpleTransferState] = useState({
  account: "mbank_firmowe",
  to_account: "mbank_osobiste",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
});

const [paymentBrokerTransferState, setPaymentBrokerTransferState] = useState({
  paynow_transfer: "",
  autopay_transfer: "",
  transfer_date: defaultDate,
  sales_date: yesterday,
  business_reference: "",
  item: "",
  note: "",
});
```

## **Plan refaktoryzacji - Etapy**

### **Etap 1: Przygotowanie i analiza** ✅

**Cel**: Zrozumienie wszystkich zależności i przygotowanie planu

1. **Audyt obecnego kodu**
   - Przeanalizuj wszystkie miejsca używające `shared`, `perType`, `transactionType`
   - Zidentyfikuj wszystkie pola używane w każdym widoku
   - Sprawdź jak `mergedFields` jest używane w komponencie

2. **Analiza zależności**
   - Sprawdź `useEffect` zależne od `transactionType`
   - Przeanalizuj cache sales data
   - Zidentyfikuj funkcje walidacji specyficzne dla typów

3. **Przygotowanie typów TypeScript**
   - Zdefiniuj interfejsy dla każdego widoku
   - Zaktualizuj `SimpleTransactionFormShape`

### **Etap 2: Refaktoryzacja stanu w hooku** ⬜

**Cel**: Zastąpienie obecnej architektury stanu nową

1. **Zastąpienie stanu**
   - Usuń `shared`, `perType`, `transactionType`
   - Dodaj `currentView` i stany dla każdego widoku
   - Zaktualizuj `defaultPrivateForType` → `defaultStateForView`

2. **Refaktoryzacja `mergedFields`**
   - Zastąp `useMemo` z `shared` + `perType` + `transactionType`
   - Nowa logika: `getCurrentViewData()` zwracająca dane aktualnego widoku

3. **Aktualizacja handlerów**
   - `handleFieldChange` - nowa logika dla aktualnego widoku
   - `handleAmountChange` - specyficzne dla widoków z kwotami
   - `handleBooleanChange` - specyficzne dla expense/income

### **Etap 3: Refaktoryzacja funkcji kontrolnych** ⬜

**Cel**: Aktualizacja reset, submit i przełączania widoków

1. **Nowa funkcja `resetCurrentView`**
   ```typescript
   const resetCurrentView = () => {
     switch (currentView) {
       case "simple_expense":
         setSimpleExpenseState(defaultSimpleExpenseState);
         break;
       case "simple_income":
         setSimpleIncomeState(defaultSimpleIncomeState);
         break;
       case "simple_transfer":
         setSimpleTransferState(defaultSimpleTransferState);
         break;
       case "payment_broker_transfer":
         setPaymentBrokerTransferState(defaultPaymentBrokerTransferState);
         break;
     }
     setErrors({});
   };
   ```

2. **Nowa funkcja `switchView`**
   ```typescript
   const switchView = (newView: "simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer") => {
     setCurrentView(newView);
     // NIE resetuj niczego!
   };
   ```

3. **Aktualizacja `submit`**
   - Użyj `getCurrentViewData()` zamiast `mergedFields`
   - Specyficzna walidacja per widok
   - Po sukcesie: `resetCurrentView()` zamiast `reset()`

### **Etap 4: Refaktoryzacja komponentu** ⬜

**Cel**: Aktualizacja UI do nowej architektury

1. **Aktualizacja radio buttons**
   - `onChange` → `switchView()` zamiast `handleFieldChange('transaction_type')`
   - `checked` → `currentView === "expense"` zamiast `transactionType`

2. **Aktualizacja renderowania pól**
   - Użyj `getCurrentViewData()` zamiast `formData`
   - Specyficzne renderowanie per widok

3. **Aktualizacja reset button**
   - `onClick` → `resetCurrentView()` zamiast `reset()`

### **Etap 5: Refaktoryzacja walidacji** ⬜

**Cel**: Dostosowanie walidacji do nowej architektury

1. **Nowe funkcje walidacji**
   - `validateSimpleExpenseForm(simpleExpenseState)`
   - `validateSimpleIncomeForm(simpleIncomeState)`
   - `validateSimpleTransferForm(simpleTransferState)`
   - `validatePaymentBrokerTransferForm(paymentBrokerTransferState)`

2. **Aktualizacja `validateSimpleTransactionForm`**
   - Użyj odpowiedniej funkcji walidacji na podstawie `currentView`

### **Etap 6: Refaktoryzacja payload building** ⬜

**Cel**: Dostosowanie budowania payload do nowej architektury

1. **Aktualizacja nazwy funkcji payload**
   - Zmień `buildSimpleTransactionPayload` → `buildTransactionPayload`
   - Funkcja już obsługuje wszystkie typy, tylko nazwa jest myliąca

2. **Opcjonalnie: Podział na osobne funkcje**
   - `buildSimpleExpensePayload(simpleExpenseState)`
   - `buildSimpleIncomePayload(simpleIncomeState)`
   - `buildSimpleTransferPayload(simpleTransferState)`
   - `buildPaymentBrokerTransferPayload(paymentBrokerTransferState)`

### **Etap 7: Refaktoryzacja efektów i cache** ⬜

**Cel**: Dostosowanie useEffect i cache do nowej architektury

1. **Sales data cache**
   - Zależność od `paymentBrokerTransferState.sales_date` zamiast `mergedFields.sales_date`
   - Fetch tylko gdy `currentView === "payment_broker_transfer"`

2. **Auto-adjust dates effect**
   - Zależność od `paymentBrokerTransferState` zamiast `mergedFields`
   - Działaj tylko gdy `currentView === "payment_broker_transfer"`

### **Etap 8: Testowanie i debugowanie** ⬜

**Cel**: Upewnienie się, że wszystko działa poprawnie

1. **Testy funkcjonalne**
   - Przełączanie między widokami zachowuje dane
   - Reset resetuje tylko aktualny widok
   - Submit działa dla wszystkich typów
   - Walidacja działa poprawnie

2. **Testy edge cases**
   - Przełączanie z wypełnionymi danymi
   - Reset po submit
   - Błędy walidacji
   - Cache sales data

3. **Debugowanie**
   - Sprawdź czy nie ma wycieków pamięci
   - Sprawdź czy wszystkie pola renderują się poprawnie
   - Sprawdź czy błędy są wyświetlane poprawnie

### **Etap 9: Czyszczenie i optymalizacja** ⬜

**Cel**: Usunięcie nieużywanego kodu i optymalizacja

1. **Usunięcie nieużywanego kodu**
   - Usuń `shared`, `perType`, `transactionType`
   - Usuń `defaultPrivateForType`
   - Usuń stary `reset()`

2. **Optymalizacja**
   - Sprawdź czy wszystkie `useCallback` i `useMemo` są nadal potrzebne
   - Zoptymalizuj renderowanie komponentu

3. **Dokumentacja**
   - Zaktualizuj komentarze w kodzie
   - Zaktualizuj README jeśli potrzeba

## **Korzyści z nowej architektury**

1. **Prawdziwa niezależność widoków** - reset jednego nie wpływa na inne
2. **Intuicyjne zachowanie** - reset = "wyczyść ten widok"
3. **Lepsze UX** - użytkownik może przerwać pracę w jednym widoku i wrócić
4. **Prostsza logika** - brak skomplikowanego łączenia stanów
5. **Łatwiejsze utrzymanie** - każdy widok ma swój własny, jasno zdefiniowany stan

## **Potencjalne ryzyka**

1. **Duża zmiana** - refaktoryzacja dotyka wielu plików
2. **Testowanie** - potrzeba przetestowania wszystkich scenariuszy
3. **Regresje** - ryzyko wprowadzenia błędów w istniejącej funkcjonalności

## **Strategia wdrażania**

1. **Implementuj etap po etapie** - nie rób wszystkiego na raz
2. **Testuj po każdym etapie** - upewnij się, że funkcjonalność działa
3. **Backup** - rób commity po każdym etapie
4. **Rollback plan** - miej plan powrotu do poprzedniej wersji 