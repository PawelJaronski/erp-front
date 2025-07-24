import { useState, useCallback, useEffect } from 'react';

interface ContextMenuState {
    isVisible: boolean;
    x: number;
    y: number;
    targetRowIds: string[];
} 

export function useContextMenu() {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        isVisible: false,
        x: 0,
        y: 0,
        targetRowIds: []
    });

    const showContextMenu = useCallback((
        event: React.MouseEvent,
        rowId: string,
        selectedRows: Set<string>
    ) => {
        event.preventDefault();
        
        const targetIds = selectedRows.has(rowId) 
            ? Array.from(selectedRows)
            : [rowId];

        setContextMenu({
            isVisible: true,
            x: event.clientX,
            y: event.clientY,
            targetRowIds: targetIds
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, isVisible: false }));
    }, []);

    useEffect(() => {
        if (!contextMenu.isVisible) return;

        const handleClickOutside = () => hideContextMenu();
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hideContextMenu();
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [contextMenu.isVisible, hideContextMenu]);

    return {
        contextMenu,
        showContextMenu,
        hideContextMenu
    };
}