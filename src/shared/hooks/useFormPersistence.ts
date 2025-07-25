import { useState, useEffect, useCallback } from 'react';

export function useFormPersistence<T>(
  initialState: T,
  formKey: string
) {
    const storageKey = `form_${formKey}`;
    
    // For testing: change to 15 * 1000 (15 seconds)
    // For production: change to 4 * 60 * 60 * 1000 (4 hours)
    const MAX_AGE = 4 * 60 * 60 * 1000; // 4 hours
    //const MAX_AGE = 10 * 1000; // 15 seconds for testing

    const getInitialState = (): T => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Check if saved data has timestamp (new format)
                if (parsed && typeof parsed === 'object' && parsed.timestamp) {
                    const age = Date.now() - parsed.timestamp;
                    
                    if (age < MAX_AGE && parsed.data && typeof parsed.data === 'object') {
                        return { ...initialState, ...parsed.data } as T;
                    }
                    // Data expired, remove it
                    localStorage.removeItem(storageKey);
                } 
                // Handle legacy format (no timestamp) - treat as expired
                else if (parsed && typeof parsed === 'object') {
                    localStorage.removeItem(storageKey);
                }
            }
        } catch {
            // Ignore errors and clean up corrupted data
            try {
                localStorage.removeItem(storageKey);
            } catch {
                // Ignore cleanup errors too
            }
        }
        return initialState;
    };

    const [state, setState] = useState<T>(getInitialState());

    useEffect(() => {
        try {
            const dataToSave = {
                data: state,
                timestamp: Date.now()
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
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