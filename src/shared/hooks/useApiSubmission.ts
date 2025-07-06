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
    submit,
  };
} 