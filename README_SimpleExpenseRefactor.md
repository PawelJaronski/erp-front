## Purpose

Refactor the **SimpleExpenseForm** component so that business logic, UI, and data‑access concerns are cleanly separated. The end result must preserve every observable behaviour while enabling future features such as multi‑currency and recurring expenses to be added incrementally.

---

## Goals and Non‑Goals

|Goals (must)|Non‑Goals (out‑of‑scope)|
|---|---|
|Preserve all current behaviour, including the `/transactions` API contract.|Adding VAT checkbox, currency conversion, or new transaction types.|
|Extract reusable validation & formatting utilities.|Redesigning page layout or theming.|
|Introduce a tested `useSimpleExpenseForm` hook that owns state & side‑effects.|Migrating state to Redux/zustand.|
|Reduce the React component to a presentational wrapper.|Database schema changes.|
|Maintain UI feedback (error banners, success confirmation, disabled submit rules).||

---

## Domain Rules and Constraints

1. **Comma decimal input** – accept `123,45`, normalise before payload.
2. **Bidirectional category sync** – selecting a category sets `category_group` and vice‑versa.
3. **API contract** – `POST /transactions` request/response shape unchanged.
4. **Error map** – one error string per field; `undefined` means valid.
5. **UI feedback** – keep current error banners, success confirmation, disabled submit state.

---

## Refactor Roadmap

### Phase 1 – Utility extraction

Create **pure**, unit‑tested helpers under `utils/`:

|File|Responsibility|
|---|---|
|`amount.ts`|Parse, format, validate Polish decimals.|
|`validation.ts`|Aggregate field‑level checks (required, future date, amount format).|
|`syncCategory.ts`|Bidirectional category/ledger account logic.|
|`payload.ts`|Build request body expected by the backend.|
|`staticData.ts`|Hard‑coded lists for accounts, category groups, categories.|

### Phase 2 – Custom hook

Introduce `useSimpleExpenseForm` under `hooks/`.

- Encapsulate form state, validation, side‑effects.
    
- Expose `{ fields, errors, isSubmitting, submit, reset, handlers }`.
    
- Add React‑Testing‑Library tests that stub `fetch` and verify:
    
    - happy‑path submit
        
    - error handling
        
    - category sync.
        

### Phase 3 – Component slimming

- Replace local state with the hook.
    
- Strip all business logic from JSX.
    
- Convert imperative UI logic to declarative props.
    
- Optional: extract reusable UI atoms (`SelectField`, `AmountField`, etc.) in a follow‑up PR.
    

> Each phase should be committed and tested independently.

---

## Recommended folder structure

```
src/
  forms/
    simple-expense/
      SimpleExpenseForm.tsx
      hooks/
        useSimpleExpenseForm.ts
      utils/
        amount.ts
        validation.ts
        syncCategory.ts
        payload.ts
        staticData.ts
      __tests__/
        amount.test.ts
        useSimpleExpenseForm.test.tsx
  types/
    transactions.ts
```

### Key interfaces

```ts
export interface SimpleExpenseInput {
  id?: string;
  date: string;           // ISO yyyy-mm-dd
  category_group: string;
  category: string;
  description: string;
  amount: string;         // Polish comma decimal
}

export type SimpleExpenseErrorMap = Record<keyof SimpleExpenseInput, string | undefined>;
```

---

## Definition of Done and Test Matrix

|Case|Sample input|Expected result|
|---|---|---|
|Valid expense|`2025-06-01`, `software`, `Lunch`, `23,50`|POST succeeds, form resets, success banner visible|
|Dot decimal|`23.50`|Error: “Use comma separator”|
|Future date|tomorrow|Error on `date` field|
|Category sync|Change category|`category_group` auto‑updates (and reverse)|
|Network failure|API returns 500|Error banner shown, no duplicate POST|

Unit tests cover utilities; integration tests cover hook; manual checklist covers table above.

---

## Risks and Must‑Avoid

- **Silent rounding** – always keep two‑decimal precision.
    
- **Double‑submit** – guard with `isSubmitting`.
    
- **Lost UI feedback** – do not remove banners or disabled logic.
    
- **Scope creep** beyond the “Goals” table.
    

---

## Related Documentation

- ADR – Transaction Form Design and Business Logic (24 Jun 2025) fileciteturn4file10
    
- Knowledge Log – Frontend Transaction Form Implementation (24 Jun 2025) fileciteturn4file1
    
- ADR – ERP Application Structure Refactoring (23 Jun 2025) fileciteturn4file18
    

---

**For Cursor AI agent**: follow the roadmap in order; write or update unit tests as soon as you extract any pure function; refuse to introduce features outside scope unless this README is updated.