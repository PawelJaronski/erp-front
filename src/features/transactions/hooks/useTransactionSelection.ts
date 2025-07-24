import { useState, useCallback } from 'react';

export function useTransactionSelection() {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const toggleSelection = useCallback((id: string) => {
        setSelectedRows(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    }, []);
    
    const selectRange = useCallback((ids: string[]) => {
        setSelectedRows(prev => {
            const newSelection = new Set(prev);
            ids.forEach(id => newSelection.add(id));
            return newSelection;
        });
    }, []);
    
    const clearSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    const selectAll = useCallback((ids: string[]) => {
        setSelectedRows(new Set(ids));
    }, []);

    return {
        selectedRows,
        toggleSelection,
        selectRange,
        clearSelection,
        selectAll,
        hasSelection: selectedRows.size > 0,
        selectedCount: selectedRows.size
    };
}