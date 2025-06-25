# ERP-Front – Simple Expense Module

> Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Jest

This repository contains the **Simple Expense** form used in the internal ERP system.  
It allows accounting staff to record expenses while enforcing domain rules such as bidirectional category ↔ group synchronisation and Polish comma-decimal validation.

---

## Key Points

* **App Router** – Next 15 with server components where required.
* **Hook-driven state** – `useSimpleExpenseForm` handles form state, validation, API calls.
* **Pure utilities** – amount parsing, validation, payload builder; all unit-tested.
* **Tailwind CSS** – utility-first styling, no global CSS apart from reset.
* **Vercel-ready** – production build passes, deployment succeeds.

---

## Project Structure

```text
src/
  app/                     # Next.js entry (layout, page)
  components/
    SimpleExpenseForm.tsx  # Presentational wrapper
  forms/
    simple-expense/
      hooks/
        useSimpleExpenseForm.ts
      utils/
        amount.ts           # comma-decimal helpers
        validation.ts       # field validation
        syncCategory.ts     # bidirectional sync logic
        payload.ts          # builds POST body
        staticData.ts       # categories, accounts, groups
      __tests__/            # Jest unit tests (excluded from prod build)
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

# Run unit tests (utilities only)
pnpm test
```

---

## Deployment

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

## License

Private internal project – © 2025 Pawel Jaronski.
