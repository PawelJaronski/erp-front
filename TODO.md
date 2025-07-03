---

## [UX/Frontend] Refactor transaction confirmation notification system

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

---
