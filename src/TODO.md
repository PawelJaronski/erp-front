# ERP Frontend: Architectural Cleanup Plan

## Current Pain Points Analysis

Looking at your current structure, the main architectural debt that will block the modern transaction list implementation:

### 1. Component Organization Chaos
```
features/transactions/components/
├── 15+ files mixed together
├── Forms, filters, lists all in one flat folder
├── No clear boundaries between responsibilities
```

### 2. Switch Statement Antipatterns
- `FieldRenderer.tsx` - giant switch for different field types
- `buildTransactionPayload.ts` - switch for transaction types
- These will be needed for inline editing but are currently brittle

### 3. Inconsistent Field Components
- Fields work in forms but not reusable for table editing
- ComboBox functionality exists but not standardized
- Validation logic scattered

## Cleanup Strategy: Make the Change Easy

### Phase 1: Component Extraction & Organization (Week 1)

**Step 1.1: Extract Reusable Field Components**
Create `components/shared/fields/` with clean, reusable components:

```
components/shared/fields/
├── AccountField.tsx       # ComboBox with accounts data
├── CategoryGroupField.tsx # ComboBox with category groups
├── CategoryField.tsx      # ComboBox with categories (no filtering)
├── AmountField.tsx        # Amount input with validation
├── DateField.tsx          # Date picker
├── TextField.tsx          # Basic text input
└── index.ts
```

Each field component should:
- Work both in forms AND table cells
- Handle their own validation display
- Support ComboBox functionality where needed
- Be completely self-contained

**Step 1.2: Reorganize by Responsibility**
```
features/transactions/
├── components/
│   ├── forms/           # Transaction creation forms
│   │   ├── TransactionFormContainer.tsx
│   │   ├── SimpleExpenseForm.tsx
│   │   ├── SimpleIncomeForm.tsx
│   │   ├── SimpleTransferForm.tsx
│   │   └── PaymentBrokerTransferForm.tsx
│   ├── list/            # Transaction display and editing
│   │   ├── TransactionList.tsx
│   │   ├── TransactionRow.tsx
│   │   └── filters/
│   └── shared/          # Reusable components
│       ├── fields/      # Field components
│       └── actions/     # FormActions, etc.
```

**Step 1.3: Eliminate FieldRenderer Switch**
Replace the switch with a clean field registry:

```typescript
// components/shared/fields/FieldRegistry.ts
import { AccountField, CategoryField, AmountField, DateField, TextField } from './index'

export const FIELD_COMPONENTS = {
  account: AccountField,
  category: CategoryField,
  categoryGroup: CategoryGroupField,
  amount: AmountField,
  date: DateField,
  text: TextField,
} as const

export function renderField(type: keyof typeof FIELD_COMPONENTS, props: any) {
  const Component = FIELD_COMPONENTS[type]
  return <Component {...props} />
}
```

### Phase 2: Transaction List Foundation (Week 2)

**Step 2.1: Modern TransactionRow Component**
```typescript
// components/list/TransactionRow.tsx
interface TransactionRowProps {
  transaction: TransactionItem
  isSelected: boolean
  isEditing: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onSave: (id: string, data: Partial<TransactionItem>) => void
  onCancel: () => void
  onContextMenu: (e: MouseEvent, id: string) => void
}
```

**Step 2.2: Context Menu System**
```typescript
// components/list/ContextMenu.tsx
interface ContextMenuProps {
  position: { x: number, y: number }
  selectedRows: string[]
  onClose: () => void
  onDelete: (ids: string[]) => void
  onEditAccount: (ids: string[]) => void
}
```

**Step 2.3: Selection State Management**
Clean hooks for managing complex interaction state:
```typescript
// hooks/useTransactionSelection.ts
// hooks/useTransactionEditing.ts  
// hooks/useContextMenu.ts
```

## Implementation Benefits

After this cleanup:

1. **Inline editing becomes trivial** - same field components work in forms and table cells
2. **Context menu integration is clean** - proper event handling hierarchy
3. **Mobile adaptations are straightforward** - component boundaries support responsive behavior
4. **New transaction types are easy** - no more switch statement modifications

## Success Criteria

The cleanup is complete when:
- [ ] Any field component works both in forms AND table cells
- [ ] Adding a new field type requires only creating one component
- [ ] No switch statements for UI rendering
- [ ] Clear component boundaries for complex interactions
- [ ] File organization reflects actual responsibilities

## Next: The Easy Change

Once this foundation is in place, implementing the modern transaction list becomes straightforward:
- Right-click context menus
- Multi-selection with checkboxes  
- Double-click inline editing
- Bulk operations
- Mobile touch interactions

## Questions for Starting

1. **Field component priority**: Should we start with the most commonly edited fields (amount, account, category) or do them all at once?

2. **Migration strategy**: Extract one field type at a time, or reorganize files first then extract components?

3. **ComboBox standardization**: Should all dropdown fields use the same ComboBox component with different data sources?

What's your preference for the starting approach?


# Step-by-Step Frontend Cleanup Guide

## Overview
This guide will transform your current transaction components into a clean, maintainable structure that supports modern inline editing. We'll start with the most frequently edited field (date) and work our way through the system.

---

## STEP 1: (done)

---

## STEP 2: Extract and Create DateField Component

### 2.1 Create the DateField Component
Create a new file: `src/features/transactions/components/shared/fields/DateField.tsx`

```typescript
import React from 'react';
import { DateInput } from '@/shared/components/form/DateInput';
import { FormField } from '@/shared/components/form/FormField';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  // New props for inline editing support
  inline?: boolean;
  className?: string;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  inline = false,
  className = ''
}: DateFieldProps) {
  // If inline mode, skip the FormField wrapper
  if (inline) {
    return (
      <div className={className}>
        <DateInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Regular form mode with label
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <DateInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </FormField>
  );
}
```

### 2.2 Create the Fields Index File
Create: `src/features/transactions/components/shared/fields/index.ts`

```typescript
export { DateField } from './DateField';
// We'll add more fields here as we create them
```

### 2.3 Test the DateField Component
Let's test this by updating ONE form to use the new DateField.

**Open**: `src/features/transactions/components/SimpleExpenseForm.tsx`

**Find this section** (around line 45-50):
```typescript
{ name: "business_timestamp", type: "date", label: "Business Date", required: true },
```

**And in the FieldRenderer switch case for "date"**, find:
```typescript
case "date":
  if (field.name === "business_timestamp") {
    return (
      <FormField label={field.label} error={formProps.errors.business_timestamp} required={field.required}>
        <DateInput
          value={(formProps.formData.business_timestamp as string | undefined) ?? ""}
          onChange={(v) => formProps.handleFieldChange("business_timestamp", v)}
        />
      </FormField>
    );
  }
```

**Replace it with**:
```typescript
case "date":
  if (field.name === "business_timestamp") {
    return (
      <DateField
        label={field.label}
        value={(formProps.formData.business_timestamp as string | undefined) ?? ""}
        onChange={(v) => formProps.handleFieldChange("business_timestamp", v)}
        error={formProps.errors.business_timestamp}
        required={field.required}
      />
    );
  }
```

**Add the import at the top of the file**:
```typescript
import { DateField } from './shared/fields';
```

### 2.4 Test Your Changes
1. Start your development server: `npm run dev`
2. Navigate to the transaction form
3. Verify the date field still works exactly as before
4. Check that validation still works (try submitting without a date)

**If something breaks**: Revert the changes and check for typos in the file paths or component names.

---

## STEP 3: Extract AccountField Component

### 3.1 Create AccountField Component
Create: `src/features/transactions/components/shared/fields/AccountField.tsx`

```typescript
import React from 'react';
import { AccountSelect } from '@/features/transactions/components/AccountSelect';
import { FormField } from '@/shared/components/form/FormField';

interface AccountFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  inline?: boolean;
  className?: string;
}

export function AccountField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select account...',
  inline = false,
  className = ''
}: AccountFieldProps) {
  if (inline) {
    return (
      <div className={className}>
        <AccountSelect
          value={value}
          onChange={onChange}
          error={error}
          placeholder={placeholder}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <FormField label={label} error={error} required={required} className={className}>
      <AccountSelect
        value={value}
        onChange={onChange}
        error={error}
        placeholder={placeholder}
      />
    </FormField>
  );
}
```

### 3.2 Update Fields Index
**Open**: `src/features/transactions/components/shared/fields/index.ts`

**Add**:
```typescript
export { DateField } from './DateField';
export { AccountField } from './AccountField';
```

### 3.3 Update FieldRenderer to Use AccountField
**Open**: `src/features/transactions/components/FieldRenderer.tsx`

**Find the "account" case** (around line 13):
```typescript
case "account":
  if (field.name === "account") {
    return (
      <FormField label={field.label} error={formProps.errors.account} required={field.required}>
        <AccountSelect
          value={(formProps.formData.account as string) ?? ""}
          onChange={(v) => formProps.handleFieldChange("account", v)}
        />
      </FormField>
    );
  }
```

**Replace with**:
```typescript
case "account":
  if (field.name === "account") {
    return (
      <AccountField
        label={field.label}
        value={(formProps.formData.account as string) ?? ""}
        onChange={(v) => formProps.handleFieldChange("account", v)}
        error={formProps.errors.account}
        required={field.required}
      />
    );
  }
```

**Add import at the top**:
```typescript
import { DateField, AccountField } from './shared/fields';
```

### 3.4 Test AccountField
1. Test the transaction form
2. Verify account selection still works
3. Check that the dropdown shows all accounts
4. Verify validation works (try submitting without selecting an account)

---

## STEP 4: Extract AmountField Component

### 4.1 Create AmountField Component
Create: `src/features/transactions/components/shared/fields/AmountField.tsx`

```typescript
import React from 'react';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { FormField } from '@/shared/components/form/FormField';

interface AmountFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  currency?: string;
  inline?: boolean;
  className?: string;
}

export function AmountField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = '123,45',
  currency = 'zł',
  inline = false,
  className = ''
}: AmountFieldProps) {
  if (inline) {
    return (
      <div className={className}>
        <AmountInput
          value={value}
          onChange={onChange}
          error={error}
          placeholder={placeholder}
          currency={currency}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <FormField label={label} error={error} required={required} className={className}>
      <AmountInput
        value={value}
        onChange={onChange}
        error={error}
        placeholder={placeholder}
        currency={currency}
      />
    </FormField>
  );
}
```

### 4.2 Update Fields Index
**Open**: `src/features/transactions/components/shared/fields/index.ts`

**Add**:
```typescript
export { DateField } from './DateField';
export { AccountField } from './AccountField';
export { AmountField } from './AmountField';
```

### 4.3 Update FieldRenderer
**Open**: `src/features/transactions/components/FieldRenderer.tsx`

**Find the "amount" case** and replace all amount field handling:

```typescript
case "amount":
  if (field.name === "gross_amount") {
    return (
      <AmountField
        label={field.label}
        value={(formProps.formData.gross_amount as string) ?? ""}
        onChange={(v) => formProps.handleFieldChange("gross_amount", v)}
        error={formProps.errors.gross_amount}
        required={field.required}
      />
    );
  } else if (field.name === "paynow_transfer") {
    return (
      <AmountField
        label={field.label}
        value={(formProps.formData.paynow_transfer as string) ?? ""}
        onChange={(v) => formProps.handleFieldChange("paynow_transfer", v)}
        error={formProps.errors.paynow_transfer}
      />
    );
  } else if (field.name === "autopay_transfer") {
    return (
      <AmountField
        label={field.label}
        value={(formProps.formData.autopay_transfer as string) ?? ""}
        onChange={(v) => formProps.handleFieldChange("autopay_transfer", v)}
        error={formProps.errors.autopay_transfer}
      />
    );
  }
  return null;
```

**Update the import**:
```typescript
import { DateField, AccountField, AmountField } from './shared/fields';
```

---

## STEP 5: Extract Remaining Field Components

Continue this pattern for the remaining fields. Here's the quick template:

### 5.1 Create CategoryField Component
Create: `src/features/transactions/components/shared/fields/CategoryField.tsx`

```typescript
import React from 'react';
import { CategorySelect } from '@/features/transactions/components/CategorySelect';
import { FormField } from '@/shared/components/form/FormField';
import { CategoryData } from '@/features/transactions/utils/staticData';

interface CategoryFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  availableCategories: readonly CategoryData[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  inline?: boolean;
  className?: string;
}

export function CategoryField({
  label,
  value,
  onChange,
  availableCategories,
  error,
  required = false,
  placeholder = 'Select category...',
  inline = false,
  className = ''
}: CategoryFieldProps) {
  if (inline) {
    return (
      <div className={className}>
        <CategorySelect
          value={value}
          onChange={onChange}
          availableCategories={availableCategories}
          error={error}
          placeholder={placeholder}
          onCustomValueChange={() => {}} // For inline editing, we'll handle this later
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <FormField label={label} error={error} required={required} className={className}>
      <CategorySelect
        value={value}
        onChange={onChange}
        availableCategories={availableCategories}
        error={error}
        placeholder={placeholder}
        onCustomValueChange={() => {}}
      />
    </FormField>
  );
}
```

### 5.2 Create TextField Component
Create: `src/features/transactions/components/shared/fields/TextField.tsx`

```typescript
import React from 'react';
import { FormField } from '@/shared/components/form/FormField';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  inline?: boolean;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  inline = false,
  className = ''
}: TextFieldProps) {
  if (inline) {
    return (
      <div className={className}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-0 focus:outline-none"
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <FormField label={label} error={error} required={required} className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
      />
    </FormField>
  );
}
```

### 5.3 Update Final Fields Index
**Open**: `src/features/transactions/components/shared/fields/index.ts`

**Complete version**:
```typescript
export { DateField } from './DateField';
export { AccountField } from './AccountField';
export { AmountField } from './AmountField';
export { CategoryField } from './CategoryField';
export { TextField } from './TextField';
```

---

## STEP 6: Move Form Components

### 6.1 Move Form Files
Move these files from `components/` to `components/forms/`:
- `TransactionFormContainer.tsx`
- `SimpleExpenseForm.tsx`
- `SimpleIncomeForm.tsx`
- `SimpleTransferForm.tsx`
- `PaymentBrokerTransferForm.tsx`

**How to move files**:
1. In VS Code, right-click the file
2. Select "Cut"
3. Navigate to `components/forms/` folder
4. Right-click and "Paste"

### 6.2 Move Shared Components
Move these to `components/shared/actions/`:
- `FormActions.tsx`

### 6.3 Move List Components
Move these to `components/list/`:
- `TransactionList.tsx`
- `TransactionItem.tsx`
- `Pagination.tsx`
- `TransactionsSum.tsx`

Create a new folder: `components/list/filters/`
Move these filter components there:
- `filters/AccountFilterSelector.tsx`
- `filters/AmountTypeSelector.tsx`
- `filters/CategoryGroupFilterSelector.tsx`
- `filters/DatePresetSelector.tsx`
- `filters/SearchInput.tsx`

---

## STEP 7: Fix Import Paths

After moving files, you'll have broken imports. Here's how to fix them:

### 7.1 Update TransactionsClient.tsx
**Open**: `src/app/finance/transactions/TransactionsClient.tsx`

**Find old imports**:
```typescript
import { AccountFilterSelector } from '@/features/transactions/components/filters/AccountFilterSelector'
import { TransactionFormContainer } from '@/features/transactions/components/TransactionFormContainer'
// etc.
```

**Replace with**:
```typescript
import { AccountFilterSelector } from '@/features/transactions/components/list/filters/AccountFilterSelector'
import { TransactionFormContainer } from '@/features/transactions/components/forms/TransactionFormContainer'
// Update all other imports similarly
```

### 7.2 Update Form Components
**Open each form component** and update imports of FormActions:

**Old**:
```typescript
import { FormActions } from '.';
```

**New**:
```typescript
import { FormActions } from '../shared/actions/FormActions';
```

### 7.3 Create New Index Files
Create: `src/features/transactions/components/forms/index.ts`
```typescript
export { TransactionFormContainer } from './TransactionFormContainer';
export { SimpleExpenseForm } from './SimpleExpenseForm';
export { SimpleIncomeForm } from './SimpleIncomeForm';
export { SimpleTransferForm } from './SimpleTransferForm';
export { PaymentBrokerTransferForm } from './PaymentBrokerTransferForm';
```

Create: `src/features/transactions/components/list/index.ts`
```typescript
export { TransactionList } from './TransactionList';
export { Pagination } from './Pagination';
export { TransactionsSum } from './TransactionsSum';
```

### 7.4 Update Main Component Index
**Open**: `src/features/transactions/components/index.ts`

**Replace entire content with**:
```typescript
// Re-export organized components
export * from './forms';
export * from './list';
export * from './shared/fields';
export * from './shared/actions';

// Keep existing exports for backward compatibility
export { AccountBalancesPanel } from './AccountBalancesPanel';
export { TransactionNotification } from './TransactionNotification';
```

---

## STEP 8: Test Everything

### 8.1 Run the Application
1. Start development server: `npm run dev`
2. Navigate to transaction forms
3. Test each form type:
   - Simple Expense
   - Simple Income  
   - Simple Transfer
   - Payment Broker Transfer

### 8.2 Verify All Features Work
- [ ] All form fields render correctly
- [ ] Validation works (try submitting empty forms)
- [ ] ComboBox dropdowns work (account, category)
- [ ] Date picker works
- [ ] Amount input accepts Polish decimal format (123,45)
- [ ] Form submission works
- [ ] Transaction list displays correctly
- [ ] Filters work

### 8.3 Check for Console Errors
Open browser developer tools (F12) and check for:
- Import errors
- Component errors
- Type errors

---

## STEP 9: Clean Up Old Files

### 9.1 Remove Obsolete Files
Now you can safely delete:
- `FieldRenderer.tsx` (once you've updated all forms to use new field components)
- `layouts.ts` (if no longer used)
- `fieldsConfig.ts` (if no longer used)

### 9.2 Update Remaining References
Search your codebase for any remaining references to these old files and update them.

---

## Success Criteria

Your cleanup is complete when:
- [ ] All forms work exactly as before
- [ ] No console errors
- [ ] File structure is organized by responsibility
- [ ] Field components work in both `inline` and regular modes
- [ ] All imports are working correctly

## Next Steps

Once this cleanup is complete, you'll have a solid foundation for implementing:
- Inline editing in the transaction list
- Right-click context menus
- Multi-selection with checkboxes
- Mobile touch interactions

## Troubleshooting

**If something breaks**:
1. Check the browser console for specific error messages
2. Verify file paths in import statements
3. Make sure you didn't miss updating an import after moving files
4. Check that component prop names match between old and new implementations

**Common issues**:
- Import path errors (check relative paths like `../` vs `./`)
- Missing exports in index.ts files
- Typos in component or prop names
- Missing dependencies in package.json

Ask for help if you get stuck on any step!