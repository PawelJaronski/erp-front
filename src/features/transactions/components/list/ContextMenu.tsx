import React from 'react';

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    targetRowIds: string[];
    onClose: () => void;
    onEditAccount: (id: string) => void;
}

export function ContextMenu({ 
    isVisible, 
    x, 
    y, 
    targetRowIds, 
    onClose, 
    onEditAccount 
}: ContextMenuProps) {
    if (!isVisible) return null;

    const isMultipleSelection = targetRowIds.length > 1;

    const handleEditAccount = () => {
        onEditAccount(targetRowIds[0]);
        onClose();
    };

    return (
        <div 
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
            style={{ left: x, top: y }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={handleEditAccount}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            >
                <span>Edit Account{isMultipleSelection ? ` (${targetRowIds.length})` : ''}</span>
                </button>

               

            </div>
    );
}