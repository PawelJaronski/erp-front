import React from 'react';

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    targetRowIds: string[];
    onClose: () => void;
    onDelete: (ids: string[]) => void;
    onEditAccount: (id: string) => void;
}

export function ContextMenu({ 
    isVisible, 
    x, 
    y, 
    targetRowIds, 
    onClose, 
    onDelete, 
    onEditAccount 
}: ContextMenuProps) {
    if (!isVisible) return null;

    const isMultipleSelection = targetRowIds.length > 1;

    const handleDelete = () => {
        onDelete(targetRowIds);
        onClose();
    };

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

                <div className="border-t border-gray-100 my-1" />

                <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                    <span>Delete{isMultipleSelection ? ` (${targetRowIds.length})` : ''}</span>
                </button>
            </div>
    );
}