import { useState, useEffect, useCallback } from 'react';

export function useFormPersistence<T>(
  initialState: T,
  formKey: string
) {
    const storageKey = `form_${formKey}`;

    const getInitialState = (): T => {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                return { ...initialState, ...parsed} as T;
            }
        }
    } catch {
        // Ignore errors
    }
    return initialState;
  }

  const [state, setState] = useState<T>(getInitialState());

  useEffect(() => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
        // Ignore errors
    }
  }, [state, storageKey]);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    try {
        localStorage.removeItem(storageKey);
    } catch {
        // Ignore errors
    }
  }, [initialState, storageKey]);

  return {
    state,
    updateState,
    resetState,
  };
}
