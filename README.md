# ERP-Front – Simple Expense Module

> Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Jest

This repository contains the **Simple Expense** form used in the internal ERP system.  
It allows accounting staff to record expenses while enforcing domain rules such as bidirectional category ↔ group synchronisation and Polish comma-decimal validation.

---

## Key Features

* **App Router** – Next 15 with server components where required.
* **Hook-driven state** – `useSimpleExpenseForm` / `useSimpleTransferForm` handle form state, validation, API calls.
* **Pure utilities** – amount parsing, validation, payload builder; all unit-tested (expense + transfer).
* **Tailwind CSS** – utility-first styling, no global CSS apart from reset.
* **Vercel-ready** – production build passes, deployment succeeds.
* **Broker transfer support** – `PaymentBrokerTransferForm` (+ hook & validator) calculates Paynow/Autopay transfers, fetches live Supabase sales and displays commission diff with error handling.

---

## Project Structure

```text
src/
  app/                     # Next.js entry (layout, page, styles)
    favicon.ico            # App icon
    globals.css            # Global styles
    layout.tsx             # Layout component
    page.tsx               # Main page component
  components/
    SimpleExpenseForm.tsx   # Expense wrapper
    SimpleTransferForm.tsx  # Transfer wrapper
  forms/
    simple-expense/
      hooks/
        useSimpleExpenseForm.ts
      utils/
        amount.ts           # comma-decimal helpers
        validation.ts       # field validation
        syncCategory.ts     # bidirectional sync logic (lenient)
        availableCategories.ts # computes available categories based on form state
        payload.ts          # builds POST body
        staticData.ts       # categories, accounts, groups
      __tests__/            # Jest unit tests (excluded from prod build)
        availableCategories.test.ts # tests for category filtering logic
  types/
    transactions.ts         # shared interfaces
```

Two **tsconfig** files are used:

| File | Purpose |
|------|---------|
| `tsconfig.json` | Production build; test files are **excluded** to keep Vercel compile fast. |
| `tsconfig.jest.json` | Extends base config; includes Jest types so unit tests type-check. |

---

## Local Development

```bash
# Install dependencies
pnpm install         # or npm / yarn

# Start dev server (http://localhost:3000)
pnpm dev

# Run unit & integration tests
pnpm test
```

---

## Deployment & Testing

Deployed on **Vercel** using the default Next.js preset. Tests are ignored during `next build`; the production build is therefore unaffected by dev-only dependencies.

---

## API Payload Example

```jsonc
{
  "transaction_type": "expense",
  "event_type": "cost_paid",
  "account": "mbank_osobiste",
  "category_group": "opex",
  "category": "ads",
  "gross_amount": "123.45",       // normalized by utils/amount.ts
  "business_timestamp": "2025-06-24"
}
```

`utils/payload.ts` is the single source of truth for building this request body.

---

## License & Acknowledgments

Private internal project – © 2025 Pawel Jaronski.

---

## Payment Broker Transfer Module

The *Broker Transfer* form allows finance teams to reconcile daily Paynow/Autopay payouts with real store sales.

Workflow:

1. User enters two transfer amounts (Paynow + Autopay) and selects *Transfer Date* (bank posting) & *Sales Date* (shop turnover day).
2. Hook `usePaymentBrokerTransferForm` automatically fetches **sum_shop_sales_on_day_pl_paynow** via Supabase RPC and caches results per‐day (in-memory).
3. Commission preview shows:
   • Total sales for `sales_date`
   • Sum of transfers entered
   • Difference (should be ~0 after commission deduction)
4. Save button is disabled while loading, on RPC error or when diff ≠ 0 ±0.01 zł.
5. On RPC error an inline banner is displayed with *Retry* action.

### Validator / Hook Guidelines

When introducing a new transaction type:

1. **Define types** in `src/features/transactions/types` extending `TransactionType` union.
2. **Create validator** in `validators/…Validator.ts` following pattern – pure sync fn returning `Record<string,string>`.
3. **Write hook** in `hooks/` leveraging `useValidation` / `useApiSubmission` and exposing same API contract (`BaseFormHookReturn`).
4. **Add unit & integration tests** (`__tests__` alongside code) – mock external calls.
5. **Update App Router toggle** in `src/app/page.tsx` if UI needs extra tab.

---
