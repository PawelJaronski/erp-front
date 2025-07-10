## 1. [UX/Frontend] Refactor transaction confirmation notification system

### Problem
Currently, the confirmation notification (success message) after submitting a transaction is tightly coupled to the fields of simple_expense/income/transfer. For new transaction types (e.g., payment_broker_transfer), the notification displays empty or irrelevant fields (e.g., "Kwota: zł", "Kategoria:", "Konto:"). This approach does not scale and requires manual if-else logic for every new type, making the code hard to maintain and error-prone.

### Goal
- Make the notification system modular and type-aware, so each transaction type can have its own dedicated confirmation template.
- Avoid code duplication and excessive if-else logic in the main form component.
- Make it easy to add new transaction types and their custom notification layouts in the future.
- Ensure that existing notifications for expense, income, and transfer are not broken.

### Proposed solution
- Extract the notification rendering logic into a separate function or component (e.g., `renderNotification(data)` or `<TransactionNotification data={...} />`).
- Use a switch or mapping based on `transaction_type` to render the appropriate template for each type.
- For example:

```tsx
function renderNotification(data) {
  switch (data.transaction_type) {
    case "simple_expense":
    case "simple_income":
      // ...
      break;
    case "simple_transfer":
      // ...
      break;
    case "payment_broker_transfer":
      // ...
      break;
    // ...future types
  }
}
```
- Use only the relevant fields for each type (e.g., show paynow/autopay/commission for broker transfer, not category/account).
- Keep the notification logic clean and maintainable.

### Acceptance criteria
- Each transaction type displays a meaningful, type-specific confirmation notification after submit.
- No empty or irrelevant fields are shown in the notification.
- Adding a new transaction type requires only adding a new case/template, not modifying the main form logic.
- Existing notifications for expense, income, and transfer remain correct.

### Example implementation

Below is a ready-to-use example of a type-aware notification rendering function for transaction confirmations. This approach keeps the notification logic clean, maintainable, and easy to extend for new transaction types.

```tsx
// In your form component file (e.g., SimpleTransactionForm.tsx):

/**
 * Renders a type-specific confirmation notification for a submitted transaction.
 * Extend this function with new cases as you add more transaction types.
 */
function renderNotification(data: typeof lastSubmitted) {
  if (!data) return null;

  switch (data.transaction_type) {
    case "simple_expense":
    case "simple_income":
      return (
        <>
          Amount: <strong>{data.gross_amount} zł</strong> <br />
          Category: <strong>{data.category}</strong>
          {data.category_group ? ` (${data.category_group})` : ""} <br />
          Account: <strong>{data.account}</strong>
        </>
      );
    case "simple_transfer":
      return (
        <>
          Amount: <strong>{data.gross_amount} zł</strong> <br />
          From: <strong>{data.account}</strong> → <strong>{data.to_account}</strong>
        </>
      );
    case "payment_broker_transfer":
      return (
        <>
          Paynow: <strong>{data.paynow_transfer} zł</strong> <br />
          Autopay: <strong>{data.autopay_transfer} zł</strong> <br />
          Transfer date: <strong>{data.transfer_date}</strong> <br />
          Sales date: <strong>{data.sales_date}</strong>
        </>
      );
    // Add more cases here for future transaction types
    default:
      return null;
  }
}
```

**Usage in the component:**

Replace the current notification details with:

```tsx
<p className="text-sm text-gray-700 mt-1">
  {renderNotification(lastSubmitted)}
</p>
```

**How to extend:**
- When adding a new transaction type, add a new `case` to `renderNotification` with the relevant fields.
- Do not modify the main form logic or notification markup elsewhere.
- This keeps the notification system scalable and easy to maintain.

## 2. [Architektura] Refaktoryzacja formularza do modularnych, reużywalnych komponentów

### Powody refaktoryzacji
- Obecny komponent `SimpleTransactionForm` obsługuje coraz więcej typów transakcji (simpleExpense, simpleIncome, simpleTransfer, paymentBrokerTransfer, vendorCost, ...), co prowadzi do rosnącej złożoności i trudności w utrzymaniu kodu.
- Wraz z rozwojem aplikacji formularz staje się tylko jednym z wielu feature'ów (obok raportów, list, itp.), a potrzeba reużycia fragmentów formularza w różnych miejscach (np. modal na liście transakcji) rośnie.
- Modularna architektura ułatwia rozwój, testowanie, reużycie i utrzymanie kodu.

### Słabości obecnej architektury
- **Monolit:** Cała logika, stan, walidacja i renderowanie wszystkich wariantów formularza znajduje się w jednym pliku/funkcji.
- **Trudność w reużyciu:** Nie można łatwo użyć tylko fragmentu formularza (np. tylko simpleExpense) w innym miejscu aplikacji bez importowania całego dużego komponentu.
- **Duplikacja kodu:** Podobne, ale nie identyczne widoki (np. simpleExpense i simpleIncome) prowadzą do powielania kodu lub rozbudowanych warunków.
- **Trudność w testowaniu:** Testowanie całości jest trudne, bo wszystko jest ze sobą powiązane.
- **Trudność w rozwoju:** Dodanie nowego typu transakcji lub zmiana logiki tylko dla jednego widoku wymaga modyfikacji dużego pliku i niesie ryzyko regresji.

### Cele modularnej architektury
- Każdy typ transakcji (simpleExpense, simpleIncome, simpleTransfer, paymentBrokerTransfer, vendorCost, ...) ma swój własny, wyspecjalizowany komponent formularza.
- Wspólne elementy (np. wybór konta, kategorii, kwoty) są osobnymi, reużywalnymi komponentami.
- Główny kontener (np. `TransactionFormContainer` lub `TransactionFormModal`) zarządza wyborem typu formularza i przekazuje odpowiednie propsy.
- Każdy pod-komponent obsługuje tylko swoją logikę, walidację i submit.
- Umożliwienie łatwego użycia dowolnego formularza w dowolnym miejscu aplikacji (modal, strona, panel boczny, itp.).

### Proponowana architektura (schemat)

```
[TransactionFormContainer / TransactionFormModal]
   |
   |-- [SimpleExpenseForm]
   |-- [SimpleIncomeForm]
   |-- [SimpleTransferForm]
   |-- [PaymentBrokerTransferForm]
   |-- [VendorCostForm]
   |
   |-- [AccountSelect]   <-- reużywalny select konta
   |-- [CategorySelect]  <-- reużywalny select kategorii
   |-- [AmountInput]     <-- reużywalne pole kwoty
   |-- ...inne reużywalne komponenty
```

- Każdy pod-komponent (np. `SimpleExpenseForm`) odpowiada tylko za swój typ transakcji: własne pola, własną walidację, własny submit.
- Wspólne elementy są osobnymi komponentami, używanymi w różnych formularzach.
- Główny kontener decyduje, który formularz pokazać (np. na podstawie typu transakcji).

### Przykład użycia w aplikacji

```jsx
// Główny kontener/modal
<TransactionFormModal type="simple_expense" onSuccess={odswiezListe} />

// W środku TransactionFormModal:
switch (type) {
  case "simple_expense":
    return <SimpleExpenseForm onSuccess={onSuccess} />;
  case "simple_income":
    return <SimpleIncomeForm onSuccess={onSuccess} />;
  // itd.
}
```

### Metody refaktoryzacji

1. **Identyfikacja wariantów:**
   - Wypisz wszystkie typy transakcji i ich specyficzne pola/logikę.
2. **Wydzielenie pod-komponentów:**
   - Dla każdego typu transakcji utwórz osobny komponent formularza (np. `SimpleExpenseForm.tsx`).
   - Przenieś do niego tylko potrzebne pola, walidację i submit.
3. **Wydzielenie reużywalnych pól:**
   - Utwórz komponenty dla powtarzalnych pól (np. `AccountSelect`, `CategorySelect`, `AmountInput`).
   - Używaj ich w pod-komponentach.
4. **Stworzenie głównego kontenera:**
   - Utwórz komponent, który na podstawie propsa `type` renderuje odpowiedni formularz.
   - Przekazuj callbacki (np. `onSuccess`, `onClose`) do pod-komponentów.
5. **Testowanie:**
   - Przetestuj każdy pod-komponent osobno.
   - Przetestuj integrację w głównym kontenerze.
6. **Stopniowa migracja:**
   - Najpierw wydziel jeden typ transakcji, przetestuj, potem kolejne.
   - Po migracji usuń nieużywane fragmenty z dużego komponentu.

### Korzyści
- **Reużywalność:** Możesz użyć dowolnego formularza w dowolnym miejscu (modal, strona, panel boczny).
- **Łatwość rozwoju:** Dodanie nowego typu transakcji to nowy komponent, a nie kolejny warunek w jednym pliku.
- **Testowalność:** Testujesz każdy formularz osobno.
- **Czystość kodu:** Każdy komponent robi jedną rzecz, brak wielkich if-else, brak duplikacji.
- **Łatwość przekazywania callbacków:** Każdy formularz przyjmuje np. `onSuccess`, więc łatwo odświeżysz dane po submitcie.

### Dalsze kroki
- Zaplanuj migrację na etapy (np. najpierw simpleExpense/simpleIncome, potem kolejne typy).
- Po refaktoryzacji dokumentuj API każdego pod-komponentu (propsy, callbacki).
- Rozważ dodanie testów jednostkowych dla nowych komponentów.

## 4. [Architektura Full-Stack] Implementacja modułowej architektury "plastry" dla spójności frontend-backend

### Problem
Obecna architektura frontendu i backendu nie odzwierciedla wspólnych domen biznesowych. Frontend ma monolityczny `SimpleTransactionForm` obsługujący wszystkie typy transakcji, podczas gdy backend prawdopodobnie ma podobnie rozproszoną logikę. Brak spójności w nazewnictwie, strukturze folderów i regułach walidacji między warstwami prowadzi do:
- Trudności w utrzymaniu kodu
- Błędów spowodowanych różnicami w walidacji
- Problemów z dodawaniem nowych typów transakcji
- Braku możliwości reużycia logiki biznesowej

### Goal
- Wprowadzenie architektury "plastry" (vertical slices) gdzie frontend i backend odzwierciedlają te same domeny biznesowe
- Spójność nazewnictwa, typów i reguł walidacji między warstwami
- Modularność umożliwiająca łatwe dodawanie nowych typów transakcji
- Reużywalność komponentów i logiki biznesowej

### Proponowana architektura

#### Struktura folderów - Frontend
```
erp-front/
├── src/
│   ├── features/                    # Plastry domenowe
│   │   ├── transactions/           # Wszystko o transakcjach
│   │   │   ├── components/         # Komponenty React
│   │   │   │   ├── SimpleExpenseForm.tsx
│   │   │   │   ├── SimpleIncomeForm.tsx
│   │   │   │   ├── SimpleTransferForm.tsx
│   │   │   │   └── PaymentBrokerTransferForm.tsx
│   │   │   ├── hooks/              # Logika biznesowa
│   │   │   ├── utils/              # Walidacja, transformacje
│   │   │   ├── types/              # TypeScript interfaces
│   │   │   └── api/                # API calls
│   │   │       ├── transactions.ts
│   │   │       └── contracts.ts    # Backend contracts
│   │   ├── reports/                # Inny plaster domenowy
│   │   └── accounts/               # Kolejny plaster
│   └── shared/                     # Komponenty współdzielone
│       ├── components/
│       ├── utils/
│       └── types/
```

#### Struktura folderów - Backend
```
erp-backend/
├── src/
│   ├── transactions/               # Ten sam plaster!
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── validators/
│   ├── reports/
│   └── accounts/
```

### Wspólne kontrakty API

#### Frontend (`src/features/transactions/types/api-contracts.ts`)
```typescript
// Oficjalne kontrakty API - używane przez frontend i backend
export const TRANSACTION_TYPES = {
  SIMPLE_EXPENSE: "simple_expense",
  SIMPLE_INCOME: "simple_income", 
  SIMPLE_TRANSFER: "simple_transfer",
  PAYMENT_BROKER_TRANSFER: "payment_broker_transfer",
  VENDOR_COST: "vendor_cost"
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

export interface TransactionApiContract {
  transaction_type: TransactionType;
  event_type: "cost_paid" | "income_received" | "transfer";
  account: string;
  category_group: string;
  category: string;
  gross_amount: number;
  business_timestamp: string;
  business_reference?: string;
  item?: string;
  note?: string;
}

export interface PaymentBrokerTransferContract extends TransactionApiContract {
  transaction_type: "payment_broker_transfer";
  paynow_transfer: number;
  autopay_transfer: number;
  transfer_date: string;
  sales_date: string;
}
```

#### Backend (Python)
```python
from enum import Enum
from pydantic import BaseModel
from typing import Literal

class TransactionType(str, Enum):
    SIMPLE_EXPENSE = "simple_expense"
    SIMPLE_INCOME = "simple_income"
    SIMPLE_TRANSFER = "simple_transfer"
    PAYMENT_BROKER_TRANSFER = "payment_broker_transfer"
    VENDOR_COST = "vendor_cost"

class TransactionApiContract(BaseModel):
    transaction_type: TransactionType
    event_type: Literal["cost_paid", "income_received", "transfer"]
    account: str
    category_group: str
    category: str
    gross_amount: float
    business_timestamp: str
    business_reference: str | None = None
    item: str | None = None
    note: str | None = None

class PaymentBrokerTransferContract(TransactionApiContract):
    transaction_type: Literal["payment_broker_transfer"]
    paynow_transfer: float
    autopay_transfer: float
    transfer_date: str
    sales_date: str
```

### Wspólne reguły walidacji

#### Frontend (`src/features/transactions/utils/validation.ts`)
```typescript
export const VALIDATION_RULES = {
  PAYMENT_BROKER_TRANSFER: {
    MIN_DAYS_BETWEEN_SALES_AND_TRANSFER: 1,
    MIN_AMOUNT: 0.01,
    REQUIRED_FIELDS: ["transfer_date", "sales_date", "paynow_transfer", "autopay_transfer"]
  }
} as const;

export function validatePaymentBrokerTransfer(data: PaymentBrokerTransferFormData) {
  const errors: Record<string, string> = {};
  
  // Te same reguły co w backendzie
  if (data.paynow_transfer <= 0 && data.autopay_transfer <= 0) {
    errors.amount = "At least one transfer amount must be positive";
  }
  
  // Sprawdzenie dat
  const transferDate = new Date(data.transfer_date);
  const salesDate = new Date(data.sales_date);
  const daysDiff = (transferDate.getTime() - salesDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < VALIDATION_RULES.PAYMENT_BROKER_TRANSFER.MIN_DAYS_BETWEEN_SALES_AND_TRANSFER) {
    errors.transfer_date = "Transfer date must be at least 1 day after sales date";
  }
  
  return errors;
}
```

#### Backend (Python)
```python
VALIDATION_RULES = {
    "PAYMENT_BROKER_TRANSFER": {
        "MIN_DAYS_BETWEEN_SALES_AND_TRANSFER": 1,
        "MIN_AMOUNT": 0.01,
        "REQUIRED_FIELDS": ["transfer_date", "sales_date", "paynow_transfer", "autopay_transfer"]
    }
}

def validate_payment_broker_transfer(data: dict) -> Dict[str, str]:
    errors = {}
    
    // Te same reguły co w frontendzie
    if data.get("paynow_transfer", 0) <= 0 and data.get("autopay_transfer", 0) <= 0:
        errors["amount"] = "At least one transfer amount must be positive"
    
    // Sprawdzenie dat
    transfer_date = datetime.strptime(data["transfer_date"], "%Y-%m-%d")
    sales_date = datetime.strptime(data["sales_date"], "%Y-%m-%d")
    days_diff = (transfer_date - sales_date).days
    
    if days_diff < VALIDATION_RULES["PAYMENT_BROKER_TRANSFER"]["MIN_DAYS_BETWEEN_SALES_AND_TRANSFER"]:
        errors["transfer_date"] = "Transfer date must be at least 1 day after sales date"
    
    return errors
```

### Komponenty modułowe

#### Frontend - Każdy typ transakcji ma swój komponent
```typescript
// src/features/transactions/components/PaymentBrokerTransferForm.tsx
export function PaymentBrokerTransferForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<PaymentBrokerTransferFormData>({
    paynow_transfer: "",
    autopay_transfer: "",
    transfer_date: "",
    sales_date: "",
    business_reference: ""
  });

  const handleSubmit = async () => {
    const payload = buildPaymentBrokerTransferPayload(formData);
    await submitPaymentBrokerTransfer(payload);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tylko pola dla payment_broker_transfer */}
    </form>
  );
}
```

#### Backend - Każdy typ transakcji ma swój handler
```python
# src/transactions/handlers/payment_broker_transfer_handler.py
class PaymentBrokerTransferHandler:
    def handle(self, data: PaymentBrokerTransferContract) -> TransactionResult:
        # Logika specyficzna dla payment_broker_transfer
        commission = self.calculate_commission(data)
        events = self.create_events(data, commission)
        return TransactionResult(events=events)
```

### Plan implementacji

#### Etap 1: Przygotowanie struktury (1-2 dni)
1. Utworzenie struktury folderów `src/features/transactions/`
2. Przeniesienie istniejących komponentów do nowej struktury
3. Stworzenie wspólnych typów i kontraktów API

#### Etap 2: Refaktoryzacja frontendu (3-5 dni)
1. Wydzielenie komponentów dla każdego typu transakcji
2. Implementacja wspólnych reguł walidacji
3. Stworzenie reużywalnych komponentów (AccountSelect, CategorySelect, etc.)

#### Etap 3: Synchronizacja backendu (2-3 dni)
1. Aktualizacja struktury folderów backendu
2. Implementacja tych samych kontraktów API
3. Synchronizacja reguł walidacji

#### Etap 4: Testowanie i dokumentacja (1-2 dni)
1. Testy end-to-end dla każdego typu transakcji
2. Dokumentacja API i komponentów
3. Przykłady użycia

### Korzyści
- **Spójność:** Frontend i backend używają tych samych nazw i reguł
- **Łatwość rozwoju:** Dodanie nowego typu transakcji to jeden plaster
- **Reużywalność:** Komponenty i logika mogą być używane w różnych miejscach
- **Testowalność:** Możliwość testowania całego plasteru end-to-end
- **Maintenance:** Zmiany w jednym typie transakcji nie wpływają na inne

### Acceptance criteria
- Każdy typ transakcji ma swój dedykowany komponent i handler
- Frontend i backend używają identycznych kontraktów API
- Reguły walidacji są identyczne w obu warstwach
- Struktura folderów odzwierciedla domeny biznesowe
- Dodanie nowego typu transakcji wymaga zmian tylko w jednym plasterze

### Ocena konwencji TODO

**Dobre strony zastosowane:**
- Struktura problem/goal/solution jest logiczna i czytelna
- Konkretne przykłady kodu ułatwiają implementację
- Szczegółowy plan implementacji z etapami
- Jasne acceptance criteria

**Ulepszenia wprowadzone:**
- Dodanie sekcji "Ocena konwencji" na końcu
- Spójny poziom szczegółowości z punktem 3
- Konkretne szacunki czasowe dla każdego etapu
- Przykłady struktury folderów z komentarzami
- Większy nacisk na praktyczne korzyści

**Słabe strony konwencji:**
- Brak priorytetów między zadaniami
- Niespójność w długości punktów
- Brak oceny trudności implementacji
- Brak zależności między zadaniami

**Rekomendacje dla przyszłych punktów:**
- Dodanie priorytetów (P1, P2, P3)
- Szacunki trudności (łatwe/średnie/trudne)
- Wskazanie zależności między zadaniami
- Krótsze, bardziej skondensowane punkty 