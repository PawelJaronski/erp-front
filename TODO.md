
> Refactor state handling and fix layout jumps for SimpleTransactionForm.

### 1  State-management refactor
* Add **shared slice** containing only:
  `gross_amount`, `business_reference`, `item`, `note`, `business_timestamp`.
* Add **perType map** keyed by `transaction_type` that stores the remaining private fields.
* On every field change update either `shared` or the active `perType[type]`.
* On `transaction_type` switch:
  * Persist current view's private fields into its slot.
  * Load or initialise next view's private fields (transfer gets `mbank_firmowe` → `mbank_osobiste` defaults).
  * Merge with `shared` and feed to the component.

### 2  Layout stabilisation (CSS Grid)
* Replace placeholder div hacks with a single grid template that always reserves space for every row/column.
* Hidden controls get `visibility:hidden` so the grid footprint is constant.
* VAT column becomes an invisible cell when transfer is active; `business_timestamp` remains right-aligned.

### 3  Success notification
* For transfers show `Konto: A → B`.
* For expense/income show `Kategoria: X (grp) — Konto: A`.

### 4  Default / cache rules
* Apply From→To defaults **only the first time** you enter transfer.
* Remember each view's private edits; never overwrite them when toggling.

### 5  (Opt) Unit tests
* Tests for per-type caching and shared slice.
* Test payload builder skips VAT for transfers.

### 6  Visual QA checklist
* No vertical jump when toggling views.
* `business_timestamp` always on the right.
* Editing in one view doesn't leak private fields to others.