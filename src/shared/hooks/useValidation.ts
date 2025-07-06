import { useState, useCallback } from 'react';

type ValidatorFunction<T> = (data: T) => Record<string, string>;

export function useValidation<T>(validator: ValidatorFunction<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: T): Record<string, string> => {
      const validationErrors = validator(data);
      setErrors(validationErrors);
      return validationErrors;
    },
    [validator]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
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
    clearAllErrors,
  };
} 