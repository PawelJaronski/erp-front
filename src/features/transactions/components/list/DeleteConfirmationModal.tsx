import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    transactionCount: number;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    transactionCount,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    // Zamknięcie przez Escape
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    // Zamknięcie przez kliknięcie w overlay
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800">
                    Confirm Deletion
                </h3>
            
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                  <button onClick={onCancel} disabled={isDeleting} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center">
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
            </div>
        </div>
    );
}
