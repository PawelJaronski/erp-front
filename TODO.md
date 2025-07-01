# Implementation Plan: Add Simple Transfer to Transaction Form

## Context & Goals

We're extending the existing `SimpleTransactionForm` to handle a third transaction type: `simple_transfer`. Currently, the form handles `simple_expense` and `simple_income` via radio button selection. We need to add `simple_transfer` as a third option.

**User Experience Goal:** When user selects "Simple Transfer", they should see From Account → To Account fields instead of category dropdowns, with amount, date, item, note, and business_reference fields remaining visible.

## Backend Contract (Agent Must Know)

The backend expects this payload for transfers:

```json
{
  "transaction_type": "simple_transfer",
  "event_type": "transfer", 
  "category_group": "internal_transfer",
  "category": "outgoing_transfer", 
  "account": "mbank_osobiste",
  "to_account": "mbank_firmowe",
  "gross_amount": "100.50",
  "business_timestamp": "2025-06-28",
  "business_reference": "optional",
  "note": "optional",
  "item": "optional"
}
```

**Key Points:**

- `account` is the source account (From)
- `to_account` is the destination account (To)
- Categories are fixed for transfers (hardcoded in payload)
- VAT fields (`include_tax`, `tax_rate`) not used for transfers
- Backend handles optional fields gracefully (sends null if empty)

## Technical Decisions Made

1. **State Preservation:** Never clear form fields when switching transaction types - preserve user's work
2. **Conditional Rendering:** Show/hide fields based on transaction type, but keep all data in state
3. **Minimal State Changes:** Only add `to_account` field to existing `SimpleTransactionFormShape`
4. **Field Visibility for Transfers:** Show account, to_account, amount, date, item, note, business_reference. Hide category fields and VAT toggle.

## Pre-Implementation Validation

**Agent: Before starting, examine and confirm:**

1. Current location of transaction type radio buttons in the JSX
2. Current structure of `SimpleTransactionFormShape` interface
3. How `buildSimpleTransactionPayload` currently works
4. How category field visibility is currently controlled
5. Current validation function structure

## Implementation Phases

### Phase 1: Add Transfer Option & To Account Field

**Objective:** Add third radio button and destination account field

**Steps:**

1. Add `"simple_transfer"` to transaction_type radio button options
2. Add `to_account?: string` to `SimpleTransactionFormShape` interface
3. Add conditional "To Account" dropdown that appears only when transaction_type is "simple_transfer"
4. Set smart default for to_account (if account is "mbank_osobiste", default to_account to "mbank_firmowe", and vice versa)

**Human Acceptance:** "I can see three radio buttons including 'Simple Transfer', and when I select it, a 'To Account' dropdown appears with a reasonable default selected."

### Phase 2: Implement Conditional Field Visibility

**Objective:** Hide irrelevant fields for transfers

**Steps:**

1. Hide category group and category dropdowns when transaction_type is "simple_transfer"
2. Hide VAT toggle and tax rate field when transaction_type is "simple_transfer"
3. Keep visible: account (labeled "From Account" for transfers), to_account, amount, date, item, note, business_reference
4. Ensure form layout remains stable (no jarring jumps)

**Human Acceptance:** "When I select Simple Transfer, I only see From Account, To Account, Amount, Date, Item, Note, and Business Reference fields. Category and VAT fields are gone."

### Phase 3: Add Transfer-Specific Logic

**Objective:** Implement validation and payload building for transfers

**Steps:**

1. Extend validation to require to_account for transfers and prevent to_account = account
2. Skip category synchronization logic when transaction_type is "simple_transfer"
3. Extend payload builder to handle transfer case (hardcode categories, include to_account, exclude VAT fields)
4. Test form submission with transfer data

**Human Acceptance:** "I can successfully submit a transfer. It prevents me from selecting the same account for From and To. The submitted transaction appears correctly in the system."

## Code Patterns to Follow

**Conditional Logic Pattern:**

```ts
const isTransfer = fields.transaction_type === 'simple_transfer';
const shouldRunCategoryLogic = !isTransfer;
```

**Field Rendering Pattern:**


```tsx
{!isTransfer && (
  // Category fields here
)}
{isTransfer && (
  // Transfer-specific fields here  
)}
```

**State Update Pattern:**


```ts
// Preserve all existing fields, only add new ones
setFields(prev => ({
  ...prev, 
  transaction_type: newType,
  to_account: prev.to_account || getDefaultToAccount(prev.account)
}));
```

## Success Criteria

- All three transaction types work without breaking existing functionality
- User can switch between types without losing form data
- Transfer submissions create correct backend payload
- Form UI is clean and intuitive for each transaction type

**Agent: Implement these phases incrementally. After each phase, show a brief summary of changes made and ask for human acceptance before proceeding to the next phase.**