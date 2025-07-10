import { useState, useCallback } from 'react';

type ValidatorFunction<T, P = void> = (data: T, params?: P) => Record<string, string>;

export function useValidation<T, P = void>(validator: ValidatorFunction<T, P>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: T, params?: P): Record<string, string> => {
      const validationErrors = validator(data, params);
      setErrors(validationErrors);
      return validationErrors;
    },
    [validator]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
  };
} 