## **Payment Broker Transfer Implementation Plan**

### **Agent Initial Verification Tasks**:

Before implementing, the agent must:

1. **Audit existing design patterns**: Radio buttons, date inputs, amount fields, loading states, error display
2. **Review existing form architecture**: useSimpleTransactionForm hook structure, conditional rendering patterns, validation approach
3. **Check API integration patterns**: Existing fetch usage, error handling, loading state management
4. **Verify naming conventions**: snake_case usage throughout existing interface

### **Phase 1: Foundation (Steps 1-3)**

**Goal**: User can select payment broker transfer and interact with specific fields

1. **Add payment_broker_transfer to transaction type options** ✅ DONE
2. **Extend useSimpleTransactionForm hook for broker state** ✅ DONE
3. **Add conditional broker fields to SimpleTransactionForm UI** ✅ DONE

_Result_: broker-transfer widok działa, pola kwot i dat renderują się poprawnie.

### **Phase 2: Data Integration (Steps 4-6)**

**Goal**: Automatic sales lookup with commission preview working

4. **Add sales lookup API integration** ✅ DONE (Supabase RPC `sum_shop_sales_on_day_pl_paynow` + caching)
5. **Implement auto-fetch on sales_date changes** ✅ DONE (useEffect + salesLoading)
6. **Add real-time commission calculation display** ✅ DONE

### **Phase 3: Business Logic (Steps 7-9)**

**Goal**: Complete working payment broker transfer with all business rules

7. **Implement date auto-adjustment logic** ✅ DONE (minimal rule: sales_date = transfer_date – 1 d if necessary)
8. **Add validation and error handling** ⬜ PARTIAL (date gap + amount validation done; sales lookup errors TBD)
9. **Complete payload building and submission** ⬜ TODO

Next immediate tasks:
• Finalise payload & submit tests (Phase 3-9)

### **Critical Requirements for Agent**:

- **Design Consistency**: Match existing component styling exactly
- **Naming Convention**: Use snake_case for all labels and field names
- **Functional Increments**: Each step must produce testable, visible results
- **Pattern Following**: Extend existing patterns, don't create new ones

**Agent, begin with verification of existing patterns, then proceed with Phase 1 implementation.**