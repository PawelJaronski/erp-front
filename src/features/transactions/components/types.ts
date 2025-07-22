import type { CategoryData } from "../utils/staticData";

export interface FieldConfig {
  name: string;
  type: string;
  label: string;
  required?: boolean;
}

export interface LayoutCell {
  name: string;
  colSpan?: number;
  colStart?: number;
}

export type LayoutRow = LayoutCell[];
export type Layout = LayoutRow[];

export type Primitive = string | number | boolean | undefined | null;

// Generic props returned from our custom form hooks
export interface FormHookProps<T extends Record<string, unknown>> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: keyof T, value: Primitive) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  availableCategories?: readonly CategoryData[];
}

// TEMPORARY alias for backwards-compatibility while migrating imports.
// Should be removed once all files are updated.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SimpleExpenseFormPropsFromHook = FormHookProps<Record<string, unknown>>;

// (legacy interface removed – use FormHookProps<T>) 