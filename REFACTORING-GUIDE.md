/**
 * COMPREHENSIVE REFACTORING GUIDE FOR AI AGENT
 * This document provides step-by-step implementation details
 */

// ===============================
// PHASE 1: CREATE NEW FILE STRUCTURE
// ===============================

/* 
STEP 1.1: Create exact directory structure
Execute these commands in terminal:

mkdir -p src/features/transactions/components
mkdir -p src/features/transactions/hooks  
mkdir -p src/features/transactions/validators
mkdir -p src/features/transactions/types
mkdir -p src/shared/components/form
mkdir -p src/shared/hooks
mkdir -p src/shared/utils
*/

// ===============================
// STEP 1.2: DEFINE COMPLETE TYPE SYSTEM
// ===============================

// File: src/features/transactions/types/index.ts
export type TransactionType = 
  | 'simple_expense' 
  | 'simple_income' 
  | 'simple_transfer' 
  | 'payment_broker_transfer';

// Base interface for all forms
interface BaseFormData {
  business_timestamp: string;
  business_reference?: string;
  item?: string;
  note?: string;
}

// Specific form data interfaces
export interface SimpleExpenseFormData extends BaseFormData {
  account: string;
  category_group: string;
  category: string;
  custom_category_group?: string;
  custom_category?: string;
  gross_amount: string;
  include_tax: boolean;
  tax_rate: number;
}

export interface SimpleIncomeFormData extends BaseFormData {
  account: string;
  category_group: string;
  category: string;
  custom_category_group?: string;
  custom_category?: string;
  gross_amount: string;
  include_tax: boolean;
  tax_rate: number;
}

export interface SimpleTransferFormData extends BaseFormData {
  account: string;
  to_account: string;
  gross_amount: string;
}

export interface PaymentBrokerTransferFormData extends BaseFormData {
  paynow_transfer?: string;
  autopay_transfer?: string;
  transfer_date?: string;
  sales_date?: string;
}

// Form hook return types
export interface BaseFormHookReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: keyof T, value: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

// ===============================
// STEP 1.3: CREATE SHARED FORM COMPONENTS
// ===============================

// File: src/shared/components/form/FormField.tsx
import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// File: src/shared/components/form/AccountSelect.tsx
import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { accounts } from '../../../forms/simple-transaction-form/utils/staticData';

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

export function AccountSelect({ 
  value, 
  onChange, 
  error, 
  label = "Account",
  placeholder = "Select account..." 
}: AccountSelectProps) {
  const resetField = () => onChange('');

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {accounts.map(account => (
          <option key={account.value} value={account.value}>
            {account.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      {value && (
        <button
          type="button"
          onClick={resetField}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          title="Clear account"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

// File: src/shared/components/form/AmountInput.tsx
import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  currency?: string;
}

export function AmountInput({ 
  value, 
  onChange, 
  error, 
  label = "Amount",
  placeholder = "123.45 or 123,45",
  currency = "zł"
}: AmountInputProps) {
  const handleAmountChange = (inputValue: string) => {
    const clean = inputValue.replace(/[^0-9,.-]/g, '');
    onChange(clean);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      {currency && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {currency}
        </span>
      )}
    </div>
  );
}

// ===============================
// STEP 1.4: CREATE VALIDATION UTILITIES
// ===============================

// File: src/shared/hooks/useValidation.ts
import { useState, useCallback } from 'react';

type ValidatorFunction<T> = (data: T) => Record<string, string>;

export function useValidation<T>(validator: ValidatorFunction<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: T): Record<string, string> => {
    const validationErrors = validator(data);
    setErrors(validationErrors);
    return validationErrors;
  }, [validator]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors
  };
}

// File: src/shared/hooks/useApiSubmission.ts
import { useState, useCallback } from 'react';

export function useApiSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (submitFn: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await submitFn();
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    submit
  };
}

// ===============================
// STEP 1.5: CREATE SPECIFIC VALIDATORS
// ===============================

// File: src/features/transactions/validators/simpleExpenseValidator.ts
import { SimpleExpenseFormData } from '../types';
import { validateAmount } from '../../../shared/utils/validation';

export function simpleExpenseValidator(data: SimpleExpenseFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required field validation
  if (!data.account?.trim()) {
    errors.account = "Select account";
  }

  const finalCategoryGroup = data.category_group === "other" 
    ? data.custom_category_group ?? "" 
    : data.category_group;
  const finalCategory = data.category === "other" 
    ? data.custom_category ?? "" 
    : data.category;

  if (!finalCategoryGroup?.trim()) {
    errors.category_group = "Select or enter category group";
  }
  if (!finalCategory?.trim()) {
    errors.category = "Select or enter category";
  }

  // Amount validation
  const amountError = validateAmount(data.gross_amount || "");
  if (amountError) {
    errors.gross_amount = amountError;
  }

  // Date validation
  if (!data.business_timestamp?.trim()) {
    errors.business_timestamp = "Select date";
  }

  return errors;
}

// File: src/features/transactions/validators/simpleTransferValidator.ts
import { SimpleTransferFormData } from '../types';
import { validateAmount } from '../../../shared/utils/validation';

export function simpleTransferValidator(data: SimpleTransferFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.account?.trim()) {
    errors.account = "Select account";
  }

  if (!data.to_account?.trim()) {
    errors.to_account = "Select destination account";
  }

  if (data.to_account && data.to_account === data.account) {
    errors.to_account = "From and To accounts must differ";
  }

  const amountError = validateAmount(data.gross_amount || "");
  if (amountError) {
    errors.gross_amount = amountError;
  }

  if (!data.business_timestamp?.trim()) {
    errors.business_timestamp = "Select date";
  }

  return errors;
}

// ===============================
// STEP 1.6: CREATE SPECIFIC HOOKS
// ===============================

// File: src/features/transactions/hooks/useSimpleExpenseForm.ts
import { useState, useCallback } from 'react';
import { SimpleExpenseFormData, BaseFormHookReturn } from '../types';
import { useValidation } from '../../../shared/hooks/useValidation';
import { useApiSubmission } from '../../../shared/hooks/useApiSubmission';
import { simpleExpenseValidator } from '../validators/simpleExpenseValidator';

const defaultSimpleExpenseState: SimpleExpenseFormData = {
  gross_amount: "",
  account: "mbank_osobiste",
  category_group: "opex",
  category: "",
  business_reference: "",
  item: "",
  note: "",
  business_timestamp: new Date().toISOString().split("T")[0],
  tax_rate: 23,
  include_tax: false,
  custom_category_group: "",
  custom_category: "",
};

interface UseSimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
}

export function useSimpleExpenseForm({ 
  onSubmit 
}: UseSimpleExpenseFormProps): BaseFormHookReturn<SimpleExpenseFormData> {
  const [formData, setFormData] = useState<SimpleExpenseFormData>(defaultSimpleExpenseState);
  const { errors, validate, clearError } = useValidation(simpleExpenseValidator);
  const { isSubmitting, submit } = useApiSubmission();

  const handleFieldChange = useCallback((field: keyof SimpleExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field as string);
  }, [clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      await submit(() => onSubmit(formData));
    }
  }, [formData, validate, submit, onSubmit]);

  const reset = useCallback(() => {
    setFormData(defaultSimpleExpenseState);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset
  };
}

// ===============================
// STEP 1.7: CREATE SPECIFIC FORM COMPONENTS
// ===============================

// File: src/features/transactions/components/SimpleExpenseForm.tsx
import React from 'react';
import { SimpleExpenseFormData } from '../types';
import { useSimpleExpenseForm } from '../hooks/useSimpleExpenseForm';
import { FormField } from '../../../shared/components/form/FormField';
import { AccountSelect } from '../../../shared/components/form/AccountSelect';
import { AmountInput } from '../../../shared/components/form/AmountInput';
import { CategoryField } from './CategoryField';
import { DateInput } from './DateInput';
import { FormActions } from './FormActions';
import { VATSection } from './VATSection';

interface SimpleExpenseFormProps {
  onSubmit: (data: SimpleExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

export function SimpleExpenseForm({ onSubmit, onCancel }: SimpleExpenseFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    reset
  } = useSimpleExpenseForm({ onSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Selection */}
      <FormField label="Account" error={errors.account} required>
        <AccountSelect 
          value={formData.account}
          onChange={(value) => handleFieldChange('account', value)}
          error={errors.account}
        />
      </FormField>

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryField 
          categoryGroup={formData.category_group}
          category={formData.category}
          customCategoryGroup={formData.custom_category_group}
          customCategory={formData.custom_category}
          onCategoryGroupChange={(value) => handleFieldChange('category_group', value)}
          onCategoryChange={(value) => handleFieldChange('category', value)}
          onCustomCategoryGroupChange={(value) => handleFieldChange('custom_category_group', value)}
          onCustomCategoryChange={(value) => handleFieldChange('custom_category', value)}
          errors={errors}
        />
      </div>

      {/* Amount and Business Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Amount (zł)" error={errors.gross_amount} required>
          <AmountInput 
            value={formData.gross_amount}
            onChange={(value) => handleFieldChange('gross_amount', value)}
            error={errors.gross_amount}
          />
        </FormField>

        <FormField label="Business Reference">
          <input
            type="text"
            value={formData.business_reference || ""}
            onChange={(e) => handleFieldChange('business_reference', e.target.value)}
            placeholder="Invoice number, order ID, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>
      </div>

      {/* Item and Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Item">
          <input
            type="text"
            value={formData.item || ""}
            onChange={(e) => handleFieldChange('item', e.target.value)}
            placeholder="What was purchased/sold"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>

        <FormField label="Note">
          <input
            type="text"
            value={formData.note || ""}
            onChange={(e) => handleFieldChange('note', e.target.value)}
            placeholder="Additional details"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          />
        </FormField>
      </div>

      {/* VAT Section and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <VATSection 
          includeTax={formData.include_tax}
          taxRate={formData.tax_rate}
          onIncludeTaxChange={(value) => handleFieldChange('include_tax', value)}
          onTaxRateChange={(value) => handleFieldChange('tax_rate', value)}
        />

        <FormField label="Business Date" error={errors.business_timestamp} required>
          <DateInput
            value={formData.business_timestamp}
            onChange={(value) => handleFieldChange('business_timestamp', value)}
          />
        </FormField>
      </div>

      {/* Form Actions */}
      <FormActions 
        onSubmit={handleSubmit}
        onReset={reset}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

// ===============================
// MIGRATION STEPS FOR AI AGENT
// ===============================

/*
PHASE 1 MIGRATION STEPS:

1. Create all the files above in exact paths
2. Copy existing utilities from current form:
   - Copy staticData.ts to features/transactions/utils/
   - Copy amount.ts to shared/utils/
   - Copy validation functions to shared/utils/
3. Update imports in existing SimpleTransactionForm.tsx to use new shared components
4. Test that existing form still works
5. Create SimpleExpenseForm as new component
6. Add feature flag to switch between old and new forms
7. Repeat for other transaction types
8. Remove old form when all types are migrated

EXACT COMMANDS TO EXECUTE:

# 1. Create file structure
mkdir -p src/features/transactions/{components,hooks,validators,types,utils}
mkdir -p src/shared/{components/form,hooks,utils}

# 2. Create type definitions
touch src/features/transactions/types/index.ts

# 3. Create shared components
touch src/shared/components/form/{FormField,AccountSelect,AmountInput,DateInput}.tsx

# 4. Create validators
touch src/features/transactions/validators/{simpleExpenseValidator,simpleTransferValidator}.ts

# 5. Create hooks
touch src/features/transactions/hooks/{useSimpleExpenseForm,useSimpleTransferForm}.ts

# 6. Create form components
touch src/features/transactions/components/{SimpleExpenseForm,SimpleTransferForm}.tsx

TESTING STRATEGY:

1. Unit test each validator function
2. Unit test each hook with renderHook
3. Integration test each form component
4. E2E test the full transaction flow

ERROR HANDLING:

1. Add error boundaries around each form
2. Add network error handling in API hooks
3. Add loading states for async operations
4. Add retry mechanisms for failed submissions
*/

## ✅ Progress Log (2025-07-06)

- [x] Phase 1 – step 1.1: directory structure created
- [x] Phase 1 – step 1.2: type system implemented (`src/features/transactions/types`)
- [x] Phase 1 – step 1.3: shared form components (FormField, AccountSelect, AmountInput, DateInput)
- [x] Phase 1 – step 1.4: validation utilities (`useValidation`, `useApiSubmission`)
- [x] Phase 1 – step 1.5: specific validator `simpleExpenseValidator`
- [x] Phase 1 – step 1.6: hook `useSimpleExpenseForm`
- [x] Phase 1 – step 1.7: minimal `SimpleExpenseForm` component with CategoryField, VATSection, FormActions

Current position: end of Phase 1 (all steps complete).  Next up – unit tests & polish (Phase 2 in this guide).