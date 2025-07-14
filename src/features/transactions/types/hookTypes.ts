import { CategoryData } from "../utils/staticData";

export interface BaseFormHookReturn<T> {
    formData: T;
    errors: Record<string, string>;
    isSubmitting: boolean;
    handleFieldChange: <K extends keyof T>(field: K, value: T[K]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    reset: () => void;
    availableCategories?: CategoryData[];
  } 