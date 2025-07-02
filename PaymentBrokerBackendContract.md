# Payment Broker Transfer Backend Contract

## API Endpoint
```
POST https://jaronski-erp-backend-production.up.railway.app/add-transaction
```

## Request Headers
```
Content-Type: application/json
```

## Request Payload Structure

### Required Fields
```typescript
{
  transaction_type: "payment_broker_transfer",
  event_type: "transfer",                    // Static value
  category_group: "payment_broker_transfer", // Static value  
  category: "paynow_payout",                 // Static value
  account: "paynow",                         // Static value
  gross_amount: number,                      // Sum of paynow_transfer + autopay_transfer
  business_timestamp: string,                // ISO date string (transfer_date)
  transfer_date: string,                     // ISO date string "YYYY-MM-DD"
  sales_date: string,                        // ISO date string "YYYY-MM-DD"
  paynow_transfer: number,                   // Amount from paynow (can be 0)
  autopay_transfer: number                   // Amount from autopay (can be 0)
}
```

### Optional Fields
```typescript
{
  business_reference?: string,               // Optional user note
  note?: string,                            // Optional additional note
  item?: string                             // Optional item reference
}
```

## Frontend Payload Calculation Logic
```typescript
// In buildSimpleTransactionPayload for payment_broker_transfer:
const paynow_amount = parseFloat(form.paynow_transfer) || 0;
const autopay_amount = parseFloat(form.autopay_transfer) || 0;
const total_transfer = paynow_amount + autopay_amount;

const payload = {
  transaction_type: "payment_broker_transfer",
  event_type: "transfer",
  category_group: "payment_broker_transfer", 
  category: "paynow_payout",
  account: "paynow",
  gross_amount: total_transfer,
  business_timestamp: form.transfer_date,    // Use transfer_date as business_timestamp
  transfer_date: form.transfer_date,
  sales_date: form.sales_date,
  paynow_transfer: paynow_amount,
  autopay_transfer: autopay_amount,
  // Optional fields only if they have values
  ...(form.business_reference?.trim() && { business_reference: form.business_reference }),
  ...(form.note?.trim() && { note: form.note }),
  ...(form.item?.trim() && { item: form.item })
};
```

## Backend Processing (What Happens)
1. **Date Auto-Adjustment**: Backend ensures sales_date is ≥1 day before transfer_date
2. **Sales Data Fetch**: Backend calls Supabase function to get sales total for sales_date
3. **Commission Calculation**: Backend calculates `commission = sales_total - (paynow_transfer + autopay_transfer)`
4. **Event Creation**: Backend creates 3 events in fin_event_store:
   - Commission cost_paid event (negative amount, account: paynow)
   - Transfer out event (negative amount, account: paynow) 
   - Transfer in event (positive amount, account: mbank_firmowe)

## Success Response
```typescript
{
  message: "Successfully processed transaction. 3 event(s) created.",
  supabase_response: [
    { status_code: 201, body: { /* commission event */ } },
    { status_code: 201, body: { /* transfer out event */ } },
    { status_code: 201, body: { /* transfer in event */ } }
  ],
  submitted_events: [
    { /* commission event data */ },
    { /* transfer out event data */ },
    { /* transfer in event data */ }
  ]
}
```

## Error Response
```typescript
{
  detail: [
    {
      type: "validation_error",
      loc: ["body", "field_name"],
      msg: "Error description",
      input: { /* submitted data */ }
    }
  ]
}
```

## Business Rules Enforced by Backend
- At least one of `paynow_transfer` or `autopay_transfer` must be > 0
- `sales_date` will be auto-adjusted if not ≥1 day before `transfer_date`
- Sales data is fetched automatically - frontend should NOT include sales_gross_amount
- Commission is calculated automatically by backend

## Frontend Validation (Before Sending)
```typescript
// In validateSimpleTransactionForm for payment_broker_transfer:
const errors: Record<string, string> = {};

if (!fields.transfer_date?.trim()) {
  errors.transfer_date = "Select transfer date";
}

if (!fields.sales_date?.trim()) {
  errors.sales_date = "Select sales date";  
}

const paynow = parseFloat(fields.paynow_transfer) || 0;
const autopay = parseFloat(fields.autopay_transfer) || 0;

if (paynow <= 0 && autopay <= 0) {
  errors.paynow_transfer = "Enter at least one transfer amount";
}

if (paynow < 0) {
  errors.paynow_transfer = "Amount must be positive";
}

if (autopay < 0) {
  errors.autopay_transfer = "Amount must be positive";
}
```

## Example Complete Request
```json
{
  "transaction_type": "payment_broker_transfer",
  "event_type": "transfer",
  "category_group": "payment_broker_transfer",
  "category": "paynow_payout", 
  "account": "paynow",
  "gross_amount": 776.71,
  "business_timestamp": "2025-07-01",
  "transfer_date": "2025-07-01",
  "sales_date": "2025-06-30",
  "paynow_transfer": 712.43,
  "autopay_transfer": 64.28,
  "business_reference": "July 1st payment broker transfer"
}
```

## Sales Lookup API (For Frontend Preview)
```
GET [SUPABASE_URL]/rest/v1/rpc/sum_shop_sales_on_day_pl_paynow?day=YYYY-MM-DD
```

**Headers:**
```
apikey: [SUPABASE_API_KEY]
Authorization: Bearer [SUPABASE_API_KEY]
```

**Response:**
```json
123.45
```

This endpoint returns the sales total as a number for the specified date, used for frontend sales preview and commission calculation display.