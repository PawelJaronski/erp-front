Step 3: Add missing text fields

File: src/forms/simple-expense/utils/validation.ts
Changes needed:

Update the ExpenseFormShape interface to include new fields:

```typescript
export interface ExpenseFormShape {
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;
  business_timestamp: string;
  transaction_type: string;
  custom_category_group?: string;
  custom_category?: string;
  include_tax: boolean;
  tax_rate: number;
  business_reference?: string;  // ADD THIS
  item?: string;               // ADD THIS
  note?: string;               // ADD THIS
}
```

File: src/forms/simple-expense/hooks/useSimpleExpenseForm.ts
Changes needed:

1. Add new fields to initial state:

```typescript
const [fields, setFields] = useState<ExpenseFormShape>({
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  gross_amount: "",
  business_timestamp: defaultDate,
  transaction_type: "expense",
  custom_category_group: "",
  custom_category: "",
  include_tax: false,
  tax_rate: 23,
  business_reference: "", // ADD THIS
  item: "",              // ADD THIS
  note: "",              // ADD THIS
});
```

2. Update the reset() function:

```typescript
const reset = () => {
  setFields({
    transaction_type: "expense",
    account: "mbank_osobiste",
    category_group: "opex",
    category: "",
    gross_amount: "",
    business_timestamp: defaultDate,
    custom_category_group: "",
    custom_category: "",
    include_tax: false,
    tax_rate: 23,
    business_reference: "", // ADD THIS
    item: "",              // ADD THIS
    note: "",              // ADD THIS
  });
  setErrors({});
};
```

File: src/components/SimpleExpenseForm.tsx
Changes needed:

Add three new input fields after the amount field (more logical placement):

```tsx
{/* ADD THESE THREE SECTIONS AFTER THE GROSS_AMOUNT FIELD */}
<div className="mb-4">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Business Reference
  </label>
  <input
    type="text"
    value={formData.business_reference || ""}
    onChange={(e) => handleFieldChange('business_reference', e.target.value)}
    placeholder="Invoice number, order ID, etc."
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  />
</div>

<div className="mb-4">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Item
  </label>
  <input
    type="text"
    value={formData.item || ""}
    onChange={(e) => handleFieldChange('item', e.target.value)}
    placeholder="What was purchased/sold"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  />
</div>

<div className="mb-4">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Note
  </label>
  <input
    type="text"
    value={formData.note || ""}
    onChange={(e) => handleFieldChange('note', e.target.value)}
    placeholder="Additional details"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  />
</div>
```

Step 4: Update payload construction

File: src/forms/simple-expense/utils/payload.ts
Changes needed:

Update the ExpensePayload interface:

```typescript
interface ExpensePayload {
  transaction_type: string;  // Change from hardcoded "expense"
  event_type: string;        // Change from hardcoded "cost_paid"
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;
  business_timestamp: string;
  business_reference?: string;  // ADD THIS
  item?: string;               // ADD THIS
  note?: string;               // ADD THIS
  include_tax?: boolean;       // ADD THIS
  tax_rate?: number;          // ADD THIS
}
```

Update the buildExpensePayload function:

```typescript
export function buildExpensePayload(form: ExpenseFormShape): ExpensePayload {
  const category_group = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const category = form.category === "other" ? form.custom_category ?? "" : form.category;

  // Determine event_type based on transaction_type
  const event_type = form.transaction_type === "expense" ? "cost_paid" : "income_received";

  const payload: ExpensePayload = {
    transaction_type: form.transaction_type,  // Change from hardcoded
    event_type,                               // Dynamic based on transaction_type
    account: form.account,
    category_group,
    category,
    gross_amount: normalizeAmount(form.gross_amount),
    business_timestamp: form.business_timestamp,
  };

  // Add optional fields only if they have values
  if (form.business_reference?.trim()) {
    payload.business_reference = form.business_reference;
  }
  if (form.item?.trim()) {
    payload.item = form.item;
  }
  if (form.note?.trim()) {
    payload.note = form.note;
  }
  if (form.include_tax) {
    payload.include_tax = form.include_tax;
    payload.tax_rate = form.tax_rate;
  }

  return payload;
}
```
