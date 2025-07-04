# Backend Documentation for Frontend Developers

## Table of Contents
1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure) **KLUCZOWA SEKCJA**
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Supported Transaction Types](#supported-transaction-types)
7. [Processor Architecture](#processor-architecture)
8. [Validation Rules](#validation-rules)
9. [Business Logic Details](#business-logic-details)
10. [Database Schema](#database-schema)
11. [Error Handling](#error-handling)
12. [Integration Guidelines for Frontend](#integration-guidelines-for-frontend)
13. [Future Extensibility](#future-extensibility)
14. [Summary](#summary)

## Quick Navigation
- **Current Architecture:** [Project Structure](#project-structure)
- **API Contracts:** [Data Models](#data-models) + [API Endpoints](#api-endpoints)
- **Transaction Types:** [Supported Transaction Types](#supported-transaction-types)
- **Validation Rules:** [Validation Rules](#validation-rules)
- **Integration Guide:** [Integration Guidelines for Frontend](#integration-guidelines-for-frontend)

## Quick Start for Frontend Developers

**Current State:** Modular processor-based architecture
**Target State:** Vertical slices architecture (aligned with frontend)
**Key Files:** 
- `processors/registry.py` (transaction type routing)
- `processors/simple_transaction.py` (expense/income logic)
- `processors/simple_transfer.py` (transfer logic)
- `models.py` (API contracts)

**Supported Transaction Types:** simple_expense, simple_income, simple_transfer, payment_broker_transfer
**Note:** payment_broker_transfer is handled by existing processors (no dedicated processor needed)

## Overview

This document provides a comprehensive overview of the ERP backend architecture, API endpoints, data models, and business logic. It's designed to help frontend developers understand how the backend processes different transaction types and how to integrate with it effectively.

## Architecture Overview

The backend follows a **modular, processor-based architecture** that's already well-structured for handling different transaction types. This is exactly what the frontend needs to align with!

### Key Architectural Patterns

1. **Processor Pattern** - Each transaction type has its own dedicated processor
2. **Registry Pattern** - Processors are registered and retrieved by transaction type
3. **Event Sourcing** - Transactions are converted to events stored in Supabase
4. **Strategy Pattern** - Different processing strategies for different transaction types

## 📁 Project Structure ⭐ **OBECNA ARCHITEKTURA**

**Jump to:** [Current Structure](#current-structure) | [Target Structure](#target-structure)

### Current Structure

```
apps/erp/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── core/                      # Core utilities and configuration
│   ├── config.py             # Environment configuration
│   ├── supabase.py           # Supabase client wrapper
│   └── timestamp.py          # Business timestamp utilities
└── contexts/                  # Business domain contexts
    └── finance/              # Finance domain
        ├── api.py            # API endpoints
        ├── models.py         # Pydantic data models
        ├── service.py        # Business logic orchestration
        ├── constants.py      # Domain constants
        └── processors/       # Transaction processors
            ├── base.py       # Abstract base processor
            ├── registry.py   # Processor registry
            ├── simple_transaction.py
            └── simple_transfer.py
```

## API Endpoints

### POST `/add-transaction`

**Purpose:** Submit a new transaction for processing

**Request Body:** `TransactionCreate` model (see Data Models section)

**Response:**
```json
{
  "message": "Successfully processed transaction. X event(s) created.",
  "supabase_response": [
    {
      "status_code": 201,
      "body": { /* Supabase response */ }
    }
  ],
  "submitted_events": [
    { /* Event data that was sent to Supabase */ }
  ]
}
```

**Example Request:**
```json
{
  "transaction_type": "simple_expense",
  "event_type": "cost_paid",
  "category_group": "opex",
  "category": "other_opex",
  "account": "mbank_osobiste",
  "gross_amount": 100.00,
  "business_timestamp": "2025-01-15",
  "business_reference": "INV-2025-001",
  "note": "Office supplies purchase",
  "include_tax": true,
  "tax_rate": 23
}
```

## Data Models

### TransactionCreate (Input Model)

```python
class TransactionCreate(BaseModel):
    transaction_type: str  # "simple_expense", "simple_income", "simple_transfer"
    event_type: str        # "cost_paid", "income_received", "transfer"
    category_group: str    # Business category group
    category: str          # Specific category
    account: str           # Source account
    gross_amount: float    # Always positive, backend handles sign
    business_timestamp: str # ISO format like "2025-06-23"
    business_reference: Optional[str] = None
    note: Optional[str] = None
    include_tax: Optional[bool] = False
    tax_rate: Optional[int] = 23
    item: Optional[str] = None
    to_account: Optional[str] = None  # Only for transfers
```

### Event Model (Output/Storage)

Events are stored in the `fin_event_store` table in Supabase:

```python
{
    "id": str,                    # UUID
    "event_type": str,            # "cost_paid", "income_received", "transfer"
    "category_group": str,        # Business category group
    "category": str,              # Specific category
    "account": str,               # Account involved
    "gross_amount": float,        # Can be negative for expenses
    "net_amount": Optional[float], # Calculated if include_tax=True
    "vat_amount": Optional[float], # Calculated if include_tax=True
    "business_reference": Optional[str],
    "business_timestamp": str,    # Full ISO timestamp
    "payload": Optional[dict]     # Additional transaction-specific data
}
```

## Supported Transaction Types

### 1. Simple Expense (`simple_expense`)

**Purpose:** Record business expenses

**Required Fields:**
- `transaction_type`: "simple_expense"
- `event_type`: "cost_paid"
- `category_group`, `category`, `account`, `gross_amount`, `business_timestamp`

**Optional Fields:**
- `include_tax`, `tax_rate` - For VAT calculations
- `business_reference`, `note`, `item`

**Processing Logic:**
- Converts `gross_amount` to negative value
- Calculates VAT if `include_tax=True`
- Creates single event in `fin_event_store`

**Example:**
```json
{
  "transaction_type": "simple_expense",
  "event_type": "cost_paid",
  "category_group": "opex",
  "category": "other_opex",
  "account": "mbank_osobiste",
  "gross_amount": 123.00,
  "business_timestamp": "2025-01-15",
  "include_tax": true,
  "tax_rate": 23
}
```

**Generated Event:**
```json
{
  "id": "uuid-here",
  "event_type": "cost_paid",
  "category_group": "opex",
  "category": "office_supplies",
  "account": "mbank_osobiste",
  "gross_amount": -123.00,
  "net_amount": -100.00,
  "vat_amount": -23.00,
  "business_timestamp": "2025-01-15T12:00:00Z",
  "payload": null
}
```

### 2. Simple Income (`simple_income`)

**Purpose:** Record business income

**Required Fields:**
- `transaction_type`: "simple_income"
- `event_type`: "income_received"
- `category_group`, `category`, `account`, `gross_amount`, `business_timestamp`

**Processing Logic:**
- Keeps `gross_amount` positive
- Calculates VAT if `include_tax=True`
- Creates single event in `fin_event_store`

### 3. Simple Transfer (`simple_transfer`)

**Purpose:** Transfer money between internal accounts

**Required Fields:**
- `transaction_type`: "simple_transfer"
- `event_type`: "transfer"
- `account`, `to_account`, `gross_amount`, `business_timestamp`
- `to_account` must be different from `account`

**Processing Logic:**
- Creates TWO events: outgoing (negative) and incoming (positive)
- Uses predefined categories: `outgoing_transfer` and `incoming_transfer`
- Category group: `internal_transfer`

**Example:**
```json
{
  "transaction_type": "simple_transfer",
  "event_type": "transfer",
  "account": "mbank_osobiste",
  "to_account": "savings_account",
  "gross_amount": 1000.00,
  "business_timestamp": "2025-01-15",
  "note": "Monthly savings transfer"
}
```

**Generated Events:**
```json
[
  {
    "id": "uuid-1",
    "event_type": "transfer",
    "category_group": "internal_transfer",
    "category": "outgoing_transfer",
    "account": "mbank_osobiste",
    "gross_amount": -1000.00,
    "business_timestamp": "2025-01-15T12:00:00Z",
    "payload": {
      "transfer_to": "savings_account",
      "note": "Monthly savings transfer"
    }
  },
  {
    "id": "uuid-2",
    "event_type": "transfer",
    "category_group": "internal_transfer",
    "category": "incoming_transfer",
    "account": "mbank_osobiste",
    "gross_amount": 1000.00,
    "business_timestamp": "2025-01-15T12:00:00Z",
    "payload": {
      "transfer_from": "mbank_firmowe",
      "note": "Monthly savings transfer"
    }
  }
]
```

## Processor Architecture

### Base Processor Interface

```python
class TransactionProcessor(ABC):
    @abstractmethod
    def process(self, transaction_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Processes the transaction data and returns a list of event dictionaries.
        This method must contain all business logic for a given transaction type.
        """
        pass
```

### Processor Registry

```python
PROCESSORS = {
    "simple_expense": SimpleTransactionProcessor(),
    "simple_income": SimpleTransactionProcessor(),
    "simple_transfer": SimpleTransferProcessor()
}

def get_processor(transaction_type: str) -> TransactionProcessor:
    """Fetches the appropriate transaction processor from the registry."""
    processor = PROCESSORS.get(transaction_type)
    if not processor:
        raise ValueError(f"No processor found for transaction type: {transaction_type}")
    return processor
```

### Adding New Transaction Types

To add a new transaction type (e.g., `payment_broker_transfer`):

1. **Create a new processor:**
```python
# contexts/finance/processors/payment_broker_transfer.py
class PaymentBrokerTransferProcessor(TransactionProcessor):
    def process(self, transaction_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Custom business logic for payment broker transfers
        # Calculate commission, create events, etc.
        pass
```

2. **Register the processor:**
```python
# contexts/finance/processors/registry.py
from .payment_broker_transfer import PaymentBrokerTransferProcessor

PROCESSORS = {
    "simple_expense": SimpleTransactionProcessor(),
    "simple_income": SimpleTransactionProcessor(),
    "simple_transfer": SimpleTransferProcessor(),
    "payment_broker_transfer": PaymentBrokerTransferProcessor()  # NEW
}
```

3. **Update the data model:**
```python
# contexts/finance/models.py
class PaymentBrokerTransferCreate(TransactionCreate):
    transaction_type: Literal["payment_broker_transfer"]
    paynow_transfer: float
    autopay_transfer: float
    transfer_date: str
    sales_date: str
```

## Validation Rules

### Backend Validation

The backend performs the following validations:

1. **Required Fields:** All required fields must be present
2. **Transfer Validation:** For transfers, `to_account` must be different from `account`
3. **Amount Validation:** `gross_amount` must be positive
4. **Tax Validation:** If `include_tax=True`, `tax_rate` must be provided
5. **Date Validation:** `business_timestamp` must be in ISO format

### Frontend-Backend Alignment

To maintain consistency, frontend should implement the same validation rules:

```typescript
// Frontend validation example
export function validateTransaction(data: TransactionFormData) {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!data.transaction_type) errors.transaction_type = "Required";
  if (!data.account) errors.account = "Required";
  if (!data.gross_amount || data.gross_amount <= 0) errors.gross_amount = "Must be positive";
  
  // Transfer-specific validation
  if (data.transaction_type === "simple_transfer") {
    if (!data.to_account) errors.to_account = "Required for transfers";
    if (data.to_account === data.account) errors.to_account = "Cannot transfer to same account";
  }
  
  // Tax validation
  if (data.include_tax && !data.tax_rate) errors.tax_rate = "Required when including tax";
  
  return errors;
}
```

## Business Logic Details

### VAT Calculation

When `include_tax=True`, the backend calculates:

```python
# From simple_transaction.py
if transaction_data.get("include_tax") and transaction_data.get("tax_rate"):
    tax_rate = Decimal(str(transaction_data["tax_rate"]))
    net_decimal = (gross_amount / (Decimal('1') + tax_rate / Decimal('100'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    vat_amount = gross_amount - net_decimal
    net_amount = net_decimal
```

**Formula:** `net_amount = gross_amount / (1 + tax_rate/100)`

### Timestamp Processing

The backend uses smart timestamp processing:

```python
def build_business_timestamp(input_str: str, smart_guess: bool = True) -> str:
    """
    Returns full ISO timestamp (UTC), e.g., 2025-06-28T14:53:00Z
    
    - If input has time (contains 'T') → leaves unchanged
    - If input is date only:
        - and smart_guess=True → adds current time (if date = today in Warsaw time)
        - otherwise → adds artificial 12:00
    """
```

### Amount Sign Handling

- **Expenses:** Backend converts to negative
- **Income:** Backend keeps positive
- **Transfers:** Creates both negative (outgoing) and positive (incoming) events

## Database Schema

### fin_event_store Table

Events are stored in Supabase with the following structure:

```sql
CREATE TABLE fin_event_store (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    category_group TEXT NOT NULL,
    category TEXT NOT NULL,
    account TEXT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2),
    vat_amount DECIMAL(10,2),
    business_reference TEXT,
    business_timestamp TIMESTAMPTZ NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

### Common Error Responses

1. **Missing Processor:**
```json
{
  "detail": "No processor found for transaction type: invalid_type"
}
```

2. **Validation Errors:**
```json
{
  "detail": [
    {
      "loc": ["body", "gross_amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

3. **Transfer Validation:**
```json
{
  "detail": "to_account cannot be the same as account"
}
```

## Integration Guidelines for Frontend

### 1. API Contract Alignment

Frontend should use the same data structures as backend:

```typescript
// Frontend types matching backend models
interface TransactionCreate {
  transaction_type: "simple_expense" | "simple_income" | "simple_transfer";
  event_type: "cost_paid" | "income_received" | "transfer";
  category_group: string;
  category: string;
  account: string;
  gross_amount: number;
  business_timestamp: string;
  business_reference?: string;
  note?: string;
  include_tax?: boolean;
  tax_rate?: number;
  item?: string;
  to_account?: string;
}
```

### 2. Validation Consistency

Implement the same validation rules as backend:

```typescript
const VALIDATION_RULES = {
  SIMPLE_EXPENSE: {
    REQUIRED_FIELDS: ["transaction_type", "event_type", "category_group", "category", "account", "gross_amount", "business_timestamp"],
    MIN_AMOUNT: 0.01
  },
  SIMPLE_TRANSFER: {
    REQUIRED_FIELDS: ["transaction_type", "event_type", "account", "to_account", "gross_amount", "business_timestamp"],
    MIN_AMOUNT: 0.01
  }
};
```

### 3. Error Handling

Handle backend errors gracefully:

```typescript
async function submitTransaction(data: TransactionCreate) {
  try {
    const response = await fetch('/add-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Transaction failed');
    }
    
    return await response.json();
  } catch (error) {
    // Handle validation errors, network errors, etc.
    console.error('Transaction submission failed:', error);
    throw error;
  }
}
```

### 4. Transaction Type Mapping

Use consistent transaction type names:

```typescript
const TRANSACTION_TYPES = {
  SIMPLE_EXPENSE: "simple_expense",
  SIMPLE_INCOME: "simple_income",
  SIMPLE_TRANSFER: "simple_transfer"
} as const;

const EVENT_TYPES = {
  COST_PAID: "cost_paid",
  INCOME_RECEIVED: "income_received",
  TRANSFER: "transfer"
} as const;
```

## Future Extensibility

The backend architecture is designed for easy extension:

1. **New Transaction Types:** Add processor + register it
2. **New Validation Rules:** Update processor logic
3. **New Event Types:** Add to constants and processors
4. **New Fields:** Extend models and processors

This modular approach means frontend can follow the same pattern:
- Each transaction type gets its own form component
- Shared validation logic
- Consistent API contracts
- Easy to add new types without affecting existing ones

## Target Structure (Vertical Slices)

**Planned Architecture Alignment:**
```
apps/erp/
├── main.py
├── requirements.txt
├── core/                      # Shared utilities
│   ├── config.py
│   ├── supabase.py
│   └── timestamp.py
└── features/                  # Vertical slices (domains)
    └── transactions/         # Transaction domain
        ├── api.py            # Transaction endpoints
        ├── models.py         # Transaction models
        ├── service.py        # Transaction orchestration
        ├── constants.py      # Transaction constants
        ├── validators.py     # Transaction validation
        └── processors/       # Transaction processors
            ├── base.py
            ├── registry.py
            ├── simple_transaction.py
            ├── simple_transfer.py
            └── payment_broker_transfer.py  # NEW
```

## Migration Plan

### Phase 1: Restructure to vertical slices (1-2 days)
1. Create `features/transactions/` directory
2. Move `contexts/finance/` content to `features/transactions/`
3. Update imports and references
4. Test existing functionality

### Phase 2: Add missing transaction types (2-3 days)
1. Optionally implement `PaymentBrokerTransferProcessor` (currently handled by existing processors)
2. Add `payment_broker_transfer` to registry if dedicated processor is created
3. Create `PaymentBrokerTransferCreate` model if needed
4. Add validation rules for payment broker transfers

### Phase 3: Enhance validation (1-2 days)
1. Create shared validation utilities
2. Align validation rules with frontend
3. Add comprehensive error messages
4. Test validation scenarios

### Phase 4: API improvements (1-2 days)
1. Add transaction type-specific endpoints
2. Improve error responses
3. Add response validation
4. Update documentation

## Summary

The backend already has a **well-structured, modular architecture** that frontend should mirror:

1. **Processor Pattern** → Each transaction type has its own form component
2. **Registry Pattern** → Form component registry based on transaction type
3. **Event Sourcing** → Clear separation between input data and stored events
4. **Validation Consistency** → Same rules in frontend and backend

By aligning frontend architecture with this backend structure, you'll achieve:
- **Consistency** between frontend and backend
- **Maintainability** through modular design
- **Extensibility** for new transaction types
- **Reliability** through shared validation rules

## Integration Status

### **Ready for Integration:**
- Modular processor architecture
- Clear API contracts
- Validation rules defined
- Error handling implemented

### **Needs Implementation:**
- Vertical slices restructuring
- Enhanced validation alignment
- API response improvements
- Dedicated `payment_broker_transfer` processor (optional - currently handled by existing processors)

### **Next Steps:**
1. Both teams restructure to vertical slices
2. Align validation rules between frontend and backend
3. Optionally create dedicated `payment_broker_transfer` processor
4. Test end-to-end integration 