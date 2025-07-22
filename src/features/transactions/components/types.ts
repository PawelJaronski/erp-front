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

export interface SimpleExpenseFormPropsFromHook {
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  availableCategories?: readonly CategoryData[];
} 