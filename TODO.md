---

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

## 2. [UX/Frontend] Refaktoryzacja pól select na React Select (combobox z filtrowaniem)

### Cel
Zastąpienie natywnych `<select>` w formularzu (np. wybór konta, kategorii) komponentem React Select, który umożliwia zarówno wybór z listy, jak i filtrowanie opcji przez wpisywanie tekstu.

---

### Szczegółowy plan krok po kroku

#### 1. Instalacja React Select

1. Otwórz terminal w katalogu głównym projektu.
2. Zainstaluj bibliotekę React Select:
   ```
   npm install react-select
   ```
   lub jeśli używasz yarn:
   ```
   yarn add react-select
   ```
3. **(WAŻNE!)** Upewnij się, że `react-select` pojawił się w pliku `package.json` w sekcji `dependencies`.

#### 2. Aktualizacja pliku z zależnościami dla Vercel

1. Jeśli korzystasz z Vercel, nie musisz robić nic więcej – Vercel automatycznie zainstaluje zależności z `package.json`.
2. Jeśli masz dodatkowy plik z wymaganiami (np. `requirements.txt` – rzadko w projektach React), upewnij się, że nie jest on używany do instalacji frontendu.

#### 3. Stworzenie własnego komponentu ComboBox

1. W katalogu `src/components/` utwórz plik `AccountSelect.tsx` (analogicznie potem dla kategorii itp.).
2. Zaimportuj React Select:
   ```tsx
   import Select from 'react-select';
   ```
3. Zaimplementuj prosty komponent, który przyjmuje propsy: `value`, `onChange`, `options`, `error` itd.
4. Przykład minimalnego komponentu:
   ```tsx
   import React from 'react';
   import Select from 'react-select';

   export default function AccountSelect({ value, onChange, options, error }) {
     return (
       <div>
         <Select
           value={options.find(opt => opt.value === value) || null}
           onChange={opt => onChange(opt ? opt.value : '')}
           options={options}
           isClearable
           placeholder="Select account..."
         />
         {error && <p className="text-sm text-red-600">{error}</p>}
       </div>
     );
   }
   ```
5. Przetestuj ten komponent w osobnym pliku testowym lub na osobnej stronie.

#### 4. Podmiana `<select>` na nowy komponent w formularzu

1. Otwórz plik `src/components/SimpleTransactionForm.tsx`.
2. Znajdź fragment odpowiedzialny za wybór konta (pole `account`).
3. Zamień `<select>` na `<AccountSelect />`:
   - Przekaż odpowiednie propsy (`value`, `onChange`, `options`, `error`).
   - Upewnij się, że obsługa zmiany (`onChange`) aktualizuje stan formularza tak jak wcześniej.
4. Przykład podmiany:
   ```tsx
   {/* Stary kod */}
   <select
     value={formData.account}
     onChange={(e) => handleFieldChange('account', e.target.value)}
     ...
   >
     ...
   </select>

   {/* Nowy kod */}
   <AccountSelect
     value={formData.account}
     onChange={val => handleFieldChange('account', val)}
     options={accounts}
     error={errors.account}
   />
   ```
5. Upewnij się, że pole działa poprawnie: można wybrać z listy, wpisać fragment tekstu, wyczyścić wybór.

#### 5. Stylowanie i integracja z resztą formularza

1. Dostosuj styl nowego komponentu, aby pasował do reszty formularza (możesz użyć propsów `className` lub customStyles z React Select).
2. Upewnij się, że obsługa błędów (np. czerwone obramowanie) działa jak wcześniej.

#### 6. Testowanie regresji

1. Przetestuj ręcznie cały flow formularza:
   - Dodawanie transakcji,
   - Resetowanie formularza,
   - Walidacja błędów,
   - Obsługa klawiatury i myszki.
2. Jeśli masz testy automatyczne, uruchom je i sprawdź, czy nie pojawiły się nowe błędy.

#### 7. Iteracja dla kolejnych pól

1. Po upewnieniu się, że pole `account` działa poprawnie, powtórz proces dla kolejnych `<select>`:
   - Kategoria (`category`)
   - Grupa kategorii (`category_group`)
   - Inne, jeśli występują
2. Możesz stworzyć generyczny komponent `ComboBoxSelect`, który będzie wykorzystywany do wszystkich pól select.

#### 8. Porządki i refaktoryzacja

1. Usuń nieużywane już fragmenty kodu `<select>`.
2. Upewnij się, że nowy kod jest czytelny i dobrze udokumentowany.
3. Zrób commity po każdej większej zmianie.

#### 9. (Opcjonalnie) Testy jednostkowe

1. Dodaj testy jednostkowe dla nowego komponentu select (jeśli masz framework testowy).
2. Przetestuj przypadki: wybór opcji, filtrowanie, czyszczenie, obsługa błędów.

---

### Podsumowanie

- Zmiany wprowadzaj iteracyjnie – najpierw jedno pole, potem kolejne.
- Po każdej zmianie testuj ręcznie i/lub automatycznie.
- Jeśli coś nie działa, wróć do poprzedniego commita i popraw.
- Po zakończeniu refaktoryzacji cały formularz powinien działać jak dotychczas, ale z lepszym UX.

---

**W razie problemów:**
- Dokumentacja React Select: https://react-select.com/home
- Przykłady użycia: https://react-select.com/props
- W razie pytań – pytaj na PR lub Slacku!

## 3. [Architektura] Refaktoryzacja formularza do modularnych, reużywalnych komponentów

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

## 4. 