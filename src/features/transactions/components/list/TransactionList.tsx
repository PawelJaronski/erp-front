import React from 'react';
import { TransactionItem } from '@/features/transactions/types';
import { TransactionRow } from './TransactionRow';
import { ContextMenu } from './ContextMenu';
import { useTransactionSelection } from '@/features/transactions/hooks/useTransactionSelection';
import { useContextMenu } from '@/features/transactions/hooks/useContextMenu';
import { deleteTransactions } from '@/features/transactions/api';
import { useDeleteConfirmation } from '@/features/transactions/hooks/useDeleteConfirmation';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ToastProvider';

interface TransactionListProps {
  transactions: TransactionItem[];
  isFetching: boolean;
  error: Error | null;
}

export function TransactionList({ transactions, isFetching, error }: TransactionListProps) {
  const {
    selectedRows,
    toggleSelection,
    clearSelection,
    selectAll,
    hasSelection,
    selectedCount
  } = useTransactionSelection();

  const {
    contextMenu,
    showContextMenu,
    hideContextMenu
  } = useContextMenu();

  const { confirmState, showConfirmation, hideConfirmation } = useDeleteConfirmation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Handle delete action
  const handleDelete = async (ids: string[]) => {
    showConfirmation(ids);
  };

  const handleConfirmedDelete = async () => {
    if (confirmState.transactionIds.length === 0) return;
    try {
      await deleteTransactions(confirmState.transactionIds);
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });

      showToast(
        `Successfully deleted ${confirmState.transactionCount} transaction${confirmState.transactionCount !== 1 ? 's' : ''}`,
        'success'
      );
      
      clearSelection();
      hideConfirmation();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete transactions';
      showToast(message, 'error');
    } finally {
      hideConfirmation();
    }
  };
  // Handle edit account action  
  const handleEditAccount = (id: string) => {
    // TODO: Implement bulk account edit
    console.log('Edit account for transaction:', id);
  };

  // Handle double-click to edit
  const handleDoubleClick = (id: string) => {
    // TODO: Implement inline editing
    console.log('Edit transaction:', id);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (hasSelection) {
      clearSelection();
    } else {
      selectAll(transactions.map(t => t.id));
    }
  };

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <p className="text-red-600">Error loading transactions: {error.message}</p>
      </div>
    );
  }

  if (!isFetching && !transactions.length) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Selection info bar */}
      {hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table container */}
      <div className={`overflow-x-auto transition-opacity duration-300 ${
        isFetching ? 'opacity-40' : 'opacity-100'
      }`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Select all checkbox */}
              <th scope="col" className="px-3 py-3">
                <input
                  type="checkbox"
                    checked={hasSelection && selectedCount === transactions.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">
                Gross
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">
                Net
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">
                VAT
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Category Group
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Account
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Business Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isSelected={selectedRows.has(transaction.id)}
                onSelect={toggleSelection}
                onContextMenu={(e, id) => showContextMenu(e, id, selectedRows)}
                onDoubleClick={handleDoubleClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading spinner */}
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Context Menu */}
      <ContextMenu
        isVisible={contextMenu.isVisible}
        x={contextMenu.x}
        y={contextMenu.y}
        targetRowIds={contextMenu.targetRowIds}
        onClose={hideContextMenu}
        onDelete={handleDelete}
        onEditAccount={handleEditAccount}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={confirmState.isOpen}
        transactionCount={confirmState.transactionCount}
        onConfirm={handleConfirmedDelete}
        onCancel={hideConfirmation}
        isDeleting={confirmState.isDeleting}
      />
    </div>
  );
}