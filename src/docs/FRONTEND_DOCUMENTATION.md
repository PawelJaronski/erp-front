# Frontend Documentation for Backend Developers

## Table of Contents
1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure) **KLUCZOWA SEKCJA**
4. [Form Components](#form-components)
5. [Data Models](#data-models)
6. [Supported Transaction Types](#supported-transaction-types)
7. [Business Logic](#business-logic)
8. [Validation System](#validation-system)
9. [Static Data](#static-data)
10. [API Integration](#api-integration)
11. [External Integrations](#external-integrations)
12. [Error Handling](#error-handling)
13. [Current Limitations and Future Plans](#current-limitations-and-future-plans)
14. [Integration Guidelines for Backend](#integration-guidelines-for-backend)
15. [Summary](#summary)

## Quick Navigation
- **Current Architecture:** [Project Structure](#project-structure)
- **Planned Architecture:** [Future Plans](#current-limitations-and-future-plans)
- **API Contracts:** [Data Models](#data-models) + [API Integration](#api-integration)
- **Validation Rules:** [Validation System](#validation-system)

## Quick Start for Backend Developers

**Current State:** Monolithic form architecture
**Target State:** Vertical slices architecture
**Key Files:** 
- `SimpleTransactionForm.tsx` (main component)
- `useSimpleTransactionForm.ts` (business logic)
- `payload.ts` (API transformation)

**Supported Transaction Types:** simple_expense, simple_income, simple_transfer, payment_broker_transfer

## Overview

This document provides a comprehensive overview of the ERP frontend architecture, form components, data models, and business logic. It's designed to help backend developers understand how the frontend processes different transaction types and how to integrate with it effectively.

## Architecture Overview

The frontend follows a **monolithic form-based architecture** that's currently being refactored to a **modular, component-based architecture** to align with the backend's processor pattern. The current implementation uses a single large form component that handles all transaction types, but this is being restructured to match the backend's modular approach.

### Key Architectural Patterns

1. **Monolithic Form Pattern** - Single form component handling all transaction types (current)
2. **Custom Hook Pattern** - Business logic separated into React hooks
3. **Utility Pattern** - Pure functions for validation, transformation, and data processing
4. **Static Data Pattern** - Hardcoded categories, accounts, and business rules

## Project Structure **OBECNA ARCHITEKTURA**

**Jump to:** [Current Structure](#current-structure) | [Target Structure](#target-structure)

### Current Structure

```
erp-front/
├── src/
│   ├── app/                       # Next.js app router
│   │   ├── page.tsx              # Main page with form
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   │   └── SimpleTransactionForm.tsx  # Main form component
│   ├── forms/                    # Form-specific logic
│   │   └── simple-transaction-form/
│   │       ├── hooks/
│   │       │   └── useSimpleTransactionForm.ts  # Main business logic
│   │       └── utils/
│   │           ├── amount.ts     # Amount parsing/validation
│   │           ├── payload.ts    # API payload building
│   │           ├── validation.ts # Form validation
│   │           ├── staticData.ts # Categories, accounts
│   │           └── sales.ts      # Sales data fetching
│   └── types/
│       └── transactions.ts       # TypeScript interfaces
```

## Form Components

### SimpleTransactionForm (Main Component)

**Location:** `src/components/SimpleTransactionForm.tsx`

**Purpose:** Single form component handling all transaction types

**Key Features:**
- Dynamic form fields based on `transaction_type`
- Real-time validation
- Success/error notifications
- Commission preview for broker transfers

**Transaction Type Selection:**
```tsx
<div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap">
  <label className="flex items-center cursor-pointer">
    <input
      type="radio"
      name="transaction_type"
      value="simple_expense"
      checked={formData.transaction_type === "simple_expense"}
      onChange={(e) => handleFieldChange('transaction_type', e.target.value)}
    />
    <span>expense</span>
  </label>
  {/* Similar for simple_income, simple_transfer, payment_broker_transfer */}
</div>
```

## Data Models

### SimpleTransactionFormShape (Form Data Model)

```typescript
export interface SimpleTransactionFormShape {
  account: string;
  category_group: string;
  category: string;
  gross_amount: string;           // Polish comma format: "123,45"
  business_timestamp: string;     // ISO format: "2025-01-15"
  transaction_type: string;       // "simple_expense", "simple_income", "simple_transfer", "payment_broker_transfer"
  custom_category_group?: string; // For "other" category group
  custom_category?: string;       // For "other" category
  include_tax: boolean;
  tax_rate: number;               // Default: 23
  business_reference?: string;
  item?: string;
  note?: string;
  to_account?: string;            // For transfers only
  
  // Payment broker transfer specific
  transfer_date?: string;         // ISO format: "2025-01-15"
  sales_date?: string;           // ISO format: "2025-01-15"
  paynow_transfer?: string;      // Polish comma format: "123,45"
  autopay_transfer?: string;     // Polish comma format: "123,45"
}
```

### API Payload Model

```typescript
interface SimpleTransactionPayload {
  transaction_type: string;
  event_type: string;
  account: string;
  category_group: string;
  category: string;
  gross_amount?: string | number;
  business_timestamp: string;
  business_reference?: string;
  item?: string;
  note?: string;
  include_tax?: boolean;
  tax_rate?: number;
  to_account?: string;
  paynow_transfer?: string;
  autopay_transfer?: string;
  transfer_date?: string;
  sales_date?: string;
}
```

## Supported Transaction Types

### 1. Simple Expense (`simple_expense`)

**Purpose:** Record business expenses

**Required Fields:**
- `transaction_type`: "simple_expense"
- `account`, `category_group`, `category`, `gross_amount`, `business_timestamp`

**Optional Fields:**
- `include_tax`, `tax_rate` - For VAT calculations
- `business_reference`, `note`, `item`

**Form Fields Displayed:**
- Account selection (mbank_firmowe, mbank_osobiste, cash, sumup)
- Category group selection (cogs_printing, cogs, opex, taxes, other)
- Category selection (filtered by category group)
- Gross amount input (Polish comma format)
- Business reference input
- Item input
- Note input
- Include tax toggle
- Business timestamp input

**Validation Rules:**
```typescript
if (!fields.account?.trim()) errors.account = "Select account";
if (!fields.category_group?.trim()) errors.category_group = "Select category group";
if (!fields.category?.trim()) errors.category = "Select category";
if (!fields.gross_amount?.trim()) errors.gross_amount = "Enter amount";
if (!fields.business_timestamp?.trim()) errors.business_timestamp = "Select date";
```

**API Payload Generated:**
```json
{
  "transaction_type": "simple_expense",
  "event_type": "cost_paid",
  "account": "mbank_osobiste",
  "category_group": "opex",
  "category": "other_opex",
  "gross_amount": "123.45",
  "business_timestamp": "2025-01-15",
  "include_tax": true,
  "tax_rate": 23,
  "business_reference": "INV-2025-001"
}
```

### 2. Simple Income (`simple_income`)

**Purpose:** Record business income

**Required Fields:**
- `transaction_type`: "simple_income"
- `account`, `category_group`, `category`, `gross_amount`, `business_timestamp`

**Form Fields Displayed:**
- Same as simple_expense

**API Payload Generated:**
```json
{
  "transaction_type": "simple_income",
  "event_type": "income_received",
  "account": "mbank_osobiste",
  "category_group": "opex",
  "category": "other_opex",
  "gross_amount": "123.45",
  "business_timestamp": "2025-01-15"
}
```

### 3. Simple Transfer (`simple_transfer`)

**Purpose:** Transfer money between internal accounts

**Required Fields:**
- `transaction_type`: "simple_transfer"
- `account`, `to_account`, `gross_amount`, `business_timestamp`
- `to_account` must be different from `account`

**Form Fields Displayed:**
- From account selection
- To account selection
- Gross amount input
- Business reference input
- Item input
- Note input
- Business timestamp input

**Validation Rules:**
```typescript
if (!fields.account?.trim()) errors.account = "Select account";
if (!fields.to_account?.trim()) errors.to_account = "Select destination account";
if (fields.to_account === fields.account) errors.to_account = "From and To accounts must differ";
if (!fields.gross_amount?.trim()) errors.gross_amount = "Enter amount";
if (!fields.business_timestamp?.trim()) errors.business_timestamp = "Select date";
```

**API Payload Generated:**
```json
{
  "transaction_type": "simple_transfer",
  "event_type": "transfer",
  "account": "mbank_firmowe",
  "to_account": "mbank_osobiste",
  "category_group": "internal_transfer",
  "category": "outgoing_transfer",
  "gross_amount": "1000.00",
  "business_timestamp": "2025-01-15",
  "note": "Monthly savings transfer"
}
```

### 4. Payment Broker Transfer (`payment_broker_transfer`)

**Purpose:** Process payment broker transfers with commission calculation

**Required Fields:**
- `transaction_type`: "payment_broker_transfer"
- `transfer_date`, `sales_date`, `paynow_transfer` OR `autopay_transfer`

**Form Fields Displayed:**
- Transfer date input
- Sales date input
- Paynow transfer amount input
- Autopay transfer amount input
- Business reference input
- Item input
- Note input

**Special Features:**
- Commission preview based on sales data
- Date validation (transfer_date must be ≥1 day after sales_date)
- At least one transfer amount required

**Validation Rules:**
```typescript
if (!fields.transfer_date?.trim()) errors.transfer_date = "Select transfer date";
if (!fields.sales_date?.trim()) errors.sales_date = "Select sales date";

// Date validation
const transferDate = new Date(fields.transfer_date);
const salesDate = new Date(fields.sales_date);
const daysDiff = (transferDate.getTime() - salesDate.getTime()) / (1000 * 60 * 60 * 24);
if (daysDiff < 1) errors.transfer_date = "transfer_date must be at least 1 day after sales_date";

// Amount validation
const paynow = parseFloat(fields.paynow_transfer) || 0;
const autopay = parseFloat(fields.autopay_transfer) || 0;
if (paynow <= 0 && autopay <= 0) errors.paynow_transfer = "Enter at least one amount";
```

**API Payload Generated:**
```json
{
  "transaction_type": "payment_broker_transfer",
  "event_type": "transfer",
  "category_group": "payment_broker_transfer",
  "category": "paynow_payout",
  "account": "paynow",
  "gross_amount": "776.71",
  "business_timestamp": "2025-07-01",
  "transfer_date": "2025-07-01",
  "sales_date": "2025-06-30",
  "paynow_transfer": "712.43",
  "autopay_transfer": "64.28",
  "business_reference": "July 1st payment broker transfer"
}
```

## Business Logic (Custom Hook)

### useSimpleTransactionForm

**Location:** `src/forms/simple-transaction-form/hooks/useSimpleTransactionForm.ts`

**Purpose:** Centralized business logic for form management

**Key Features:**
- State management for all transaction types
- Form validation
- API submission
- Data transformation

**State Management:**
```typescript
const [currentView, setCurrentView] = useState<"simple_expense" | "simple_income" | "simple_transfer" | "payment_broker_transfer">("simple_expense");

const [simpleExpenseState, setSimpleExpenseState] = useState(defaultSimpleExpenseState);
const [simpleIncomeState, setSimpleIncomeState] = useState(defaultSimpleIncomeState);
const [simpleTransferState, setSimpleTransferState] = useState(defaultSimpleTransferState);
const [paymentBrokerTransferState, setPaymentBrokerTransferState] = useState(defaultPaymentBrokerTransferState);
```

**Default States:**
```typescript
const defaultSimpleExpenseState = {
  gross_amount: "",
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: defaultDate,
  tax_rate: 23,
  include_tax: false,
  custom_category_group: "",
  custom_category: "",
};

const defaultPaymentBrokerTransferState = {
  paynow_transfer: "",
  autopay_transfer: "",
  transfer_date: defaultDate,
  sales_date: yesterday,
  business_reference: "",
  item: "",
  note: "",
};
```

## Validation System

### Form Validation

**Location:** `src/forms/simple-transaction-form/utils/validation.ts`

**Purpose:** Client-side validation before API submission

**Validation Function:**
```typescript
export function validateSimpleTransactionForm(fields: SimpleTransactionFormShape): Record<string, string> {
  const errors: Record<string, string> = {};

  // Common validations
  if (fields.transaction_type !== "payment_broker_transfer" && !fields.account?.trim()) {
    errors.account = "Select account";
  }

  // Transaction-specific validations
  if (fields.transaction_type === "simple_transfer") {
    if (!fields.to_account?.trim()) errors.to_account = "Select destination account";
    if (fields.to_account === fields.account) errors.to_account = "From and To accounts must differ";
  }

  // Amount validation
  if (fields.transaction_type !== "payment_broker_transfer") {
    const amountError = validateAmount(fields.gross_amount || "");
    if (amountError) errors.gross_amount = amountError;
  }

  return errors;
}
```

### Amount Validation

**Location:** `src/forms/simple-transaction-form/utils/amount.ts`

**Purpose:** Polish comma decimal format validation

**Key Functions:**
```typescript
export function normalizeAmount(raw: string): string {
  // Converts "123,45" to "123.45"
  return raw.replace(",", ".").replace(/\.(?=.*\.)/g, "");
}

export function parseAmount(raw: string): number {
  return Number(normalizeAmount(raw));
}

export function validateAmount(raw: string): string | undefined {
  if (!raw.trim()) return "Enter amount";
  const value = parseAmount(raw);
  if (Number.isNaN(value) || value <= 0) return "Enter valid amount greater than 0";
  return undefined;
}
```

## Static Data

### Categories and Accounts

**Location:** `src/forms/simple-transaction-form/utils/staticData.ts`

**Categories by Group:**
```typescript
export const categoriesData = [
  // cogs_printing
  { value: "calendar", group: "cogs_printing" },
  { value: "mug_330", group: "cogs_printing" },
  { value: "mug_590", group: "cogs_printing" },
  { value: "shipping_reflect", group: "cogs_printing" },
  { value: "tshirt_black", group: "cogs_printing" },
  { value: "tshirt_white", group: "cogs_printing" },

  // cogs
  { value: "prowizje_bramki", group: "cogs" },

  // opex
  { value: "ads", group: "opex" },
  { value: "biuro", group: "opex" },
  { value: "car_cost", group: "opex" },
  { value: "car_leasing", group: "opex" },
  { value: "credit_line_cost", group: "opex" },
  { value: "credit_line_payment", group: "opex" },
  { value: "equipment", group: "opex" },
  { value: "leasing", group: "opex" },
  { value: "loan_cost", group: "opex" },
  { value: "loan_payment", group: "opex" },
  { value: "other_opex", group: "opex" },
  { value: "owner_payment", group: "opex" },
  { value: "reconciliation", group: "opex" },
  { value: "services", group: "opex" },
  { value: "shipping", group: "opex" },
  { value: "software", group: "opex" },
  { value: "trade_fair", group: "opex" },
  { value: "transport", group: "opex" },

  // taxes
  { value: "vat", group: "taxes" },
  { value: "zus", group: "taxes" },
] as const;

export const accounts = [
  { value: "mbank_firmowe", label: "mbank_firmowe" },
  { value: "mbank_osobiste", label: "mbank_osobiste" },
  { value: "cash", label: "cash" },
  { value: "sumup", label: "sumup" },
] as const;

export const categoryGroups = [
  { value: "cogs_printing", label: "cogs_printing" },
  { value: "cogs", label: "cogs" },
  { value: "opex", label: "opex" },
  { value: "taxes", label: "taxes" },
  { value: "other", label: "other" },
] as const;
```

## API Integration

### Backend Communication

**Endpoint:** `POST https://jaronski-erp-backend-production.up.railway.app/add-transaction`

**Headers:**
```
Content-Type: application/json
```

**Submission Logic:**
```typescript
const submit = async () => {
  setIsSubmitting(true);
  
  try {
    const payload = buildSimpleTransactionPayload(mergedFields);
    console.log('Payload wysyłany do backendu:', payload);
    
    const res = await fetch(
      "https://jaronski-erp-backend-production.up.railway.app/add-transaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      let backendMsg = "Unknown error";
      try {
        const errJson = await res.json();
        backendMsg = JSON.stringify(errJson);
      } catch {
        const text = await res.text();
        backendMsg = text;
      }
      throw new Error(`Backend error ${res.status}: ${backendMsg}`);
    }

    reset();
    return true;
  } catch (e: unknown) {
    console.error(e);
    return false;
  } finally {
    setIsSubmitting(false);
  }
};
```

### Payload Building

**Location:** `src/forms/simple-transaction-form/utils/payload.ts`

**Purpose:** Transform form data to backend API format

**Key Logic:**
```typescript
export function buildSimpleTransactionPayload(form: SimpleTransactionFormShape): SimpleTransactionPayload {
  const category_group = form.category_group === "other" ? form.custom_category_group ?? "" : form.category_group;
  const category = form.category === "other" ? form.custom_category ?? "" : form.category;

  let event_type: string;
  let finalCategoryGroup: string = category_group;
  let finalCategory: string = category;

  if (form.transaction_type === "simple_transfer" || form.transaction_type === "payment_broker_transfer") {
    event_type = "transfer";
    finalCategoryGroup = "internal_transfer";
    finalCategory = "outgoing_transfer";
  } else {
    event_type = form.transaction_type === "simple_expense" ? "cost_paid" : "income_received";
  }

  const payload: SimpleTransactionPayload = {
    transaction_type: form.transaction_type,
    event_type,
    account: form.account,
    category_group: finalCategoryGroup,
    category: finalCategory,
    business_timestamp: form.business_timestamp,
  };

  // Special handling for payment_broker_transfer
  if (form.transaction_type === "payment_broker_transfer") {
    payload.category_group = "payment_broker_transfer";
    payload.category = "paynow_payout";
    payload.account = "paynow";

    const paynow = parseAmount(form.paynow_transfer || "0");
    const autopay = parseAmount(form.autopay_transfer || "0");
    const total = paynow + autopay;

    payload.gross_amount = normalizeAmount(total.toString());
    payload.business_timestamp = form.transfer_date ?? "";
    payload.transfer_date = form.transfer_date;
    payload.sales_date = form.sales_date;
    payload.paynow_transfer = paynow.toString();
    payload.autopay_transfer = autopay.toString();
  } else {
    payload.gross_amount = normalizeAmount(form.gross_amount || "");
    
    if (form.transaction_type === "simple_transfer") {
      payload.to_account = form.to_account ?? "";
    }
  }

  return payload;
}
```

## External Integrations

### Sales Data Integration

**Location:** `src/forms/simple-transaction-form/utils/sales.ts`

**Purpose:** Fetch sales data for commission calculation preview

**Supabase Integration:**
```typescript
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
```

**Sales Data Fetching:**
```typescript
export async function fetchSalesData(date: string): Promise<number | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('sum_shop_sales_on_day_pl_paynow', {
      day: date
    });

    if (error) {
      console.error('Error fetching sales data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return null;
  }
}
```

## Error Handling

### Frontend Error Handling

**Form Validation Errors:**
- Real-time validation with error messages
- Field-specific error styling (red borders, error text)
- Form submission blocked until all errors resolved

**API Error Handling:**
```typescript
if (!res.ok) {
  let backendMsg = "Unknown error";
  try {
    const errJson = await res.json();
    backendMsg = JSON.stringify(errJson);
  } catch {
    const text = await res.text();
    backendMsg = text;
  }
  throw new Error(`Backend error ${res.status}: ${backendMsg}`);
}
```

**User Feedback:**
- Success notifications with transaction details
- Error notifications with retry options
- Loading states during API calls

## Current Limitations and Future Plans

### Current Architecture Issues

1. **Monolithic Form:** Single component handling all transaction types
2. **Tight Coupling:** Form logic mixed with UI logic
3. **Hardcoded Data:** Categories and accounts in static files
4. **Limited Reusability:** Cannot use individual transaction forms elsewhere

### Target Structure (Vertical Slices)

**Target Architecture:**
```
src/features/transactions/
├── components/
│   ├── SimpleExpenseForm.tsx
│   ├── SimpleIncomeForm.tsx
│   ├── SimpleTransferForm.tsx
│   └── PaymentBrokerTransferForm.tsx
├── hooks/
├── utils/
├── types/
└── api/
```

**Benefits:**
- Each transaction type has its own component
- Shared validation and utility functions
- Easy to add new transaction types
- Reusable components for modals, sidebars, etc.

## 📋 Migration Plan

### Phase 1: Create new structure (1-2 days)
1. Create `src/features/transactions/` directory
2. Create subdirectories: `components/`, `hooks/`, `utils/`, `types/`, `api/`
3. Move existing files to new structure

### Phase 2: Extract transaction components (3-5 days)
1. Create `SimpleExpenseForm.tsx` from existing logic
2. Create `SimpleIncomeForm.tsx` from existing logic
3. Create `SimpleTransferForm.tsx` from existing logic
4. Create `PaymentBrokerTransferForm.tsx` from existing logic

### Phase 3: Shared components (2-3 days)
1. Extract `AccountSelect` component
2. Extract `CategorySelect` component
3. Extract `AmountInput` component
4. Extract `DateInput` component

### Phase 4: Testing and integration (1-2 days)
1. Test each component individually
2. Test integration with backend
3. Update main page to use new components

## Integration Guidelines for Backend

### 1. API Contract Alignment

Frontend expects backend to accept the exact payload structure shown above. Key points:

- **Amount Format:** Frontend sends amounts as strings (normalized from Polish comma format)
- **Date Format:** ISO format "YYYY-MM-DD" for business_timestamp
- **Optional Fields:** Only included if they have values (not null/undefined/empty)

### 2. Error Response Format

Frontend expects error responses in this format:
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "validation_error"
    }
  ]
}
```

### 3. Success Response Format

Frontend expects success responses in this format:
```json
{
  "message": "Successfully processed transaction. X event(s) created.",
  "supabase_response": [...],
  "submitted_events": [...]
}
```

### 4. Validation Consistency

Backend should implement the same validation rules as frontend:

- Required fields validation
- Transfer account validation (to_account ≠ account)
- Amount validation (positive numbers)
- Date validation for payment_broker_transfer

### 5. Transaction Type Support

Frontend currently supports these transaction types:
- `simple_expense`
- `simple_income`
- `simple_transfer`
- `payment_broker_transfer`

Backend should support all of these with the exact same field names and validation rules.

## Summary

The frontend currently uses a **monolithic form architecture** that's being refactored to match the backend's **modular processor architecture**. Key integration points:

1. **API Contracts:** Frontend and backend use identical payload structures
2. **Validation Rules:** Same validation logic in both layers
3. **Transaction Types:** Consistent naming and field requirements
4. **Error Handling:** Compatible error response formats

The planned refactoring will create a **feature-based architecture** that mirrors the backend's processor pattern, enabling better maintainability and extensibility for both frontend and backend developers. 