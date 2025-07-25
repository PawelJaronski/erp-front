import { useState, useCallback } from 'react';

interface DeleteConfirmationState {
    isOpen: boolean;
    transactionIds: string[];
    transactionCount: number;
    isDeleting: boolean;
}

export function useDeleteConfirmation() {
    const [confirmState, setConfirmState] = useState<DeleteConfirmationState>({
        isOpen: false,
        transactionIds: [],
        transactionCount: 0,
        isDeleting: false
    });

    const showConfirmation = useCallback((ids: string[]) => {
        setConfirmState({
            isOpen: true,
            transactionIds: ids,
            transactionCount: ids.length,
            isDeleting: false
        });
    }, []);

    const hideConfirmation = useCallback(() => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }, []);
    
    const startDeleting = useCallback(() => {
        setConfirmState(prev => ({ ...prev, isDeleting: true }));
    }, []);

    return {
        confirmState,
        showConfirmation,
        hideConfirmation,
        startDeleting
    };
}
