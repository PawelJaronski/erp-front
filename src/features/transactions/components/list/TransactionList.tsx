import React, { useState } from 'react';
import { TransactionItem } from '@/features/transactions/types';
import { TransactionRow } from './TransactionRow';
import { TransactionEditModal } from '../TransactionEditModal';
import { EditableTransactionRow } from './EditableTransactionRow';
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
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  
  const { selectedRows, toggleSelection, clearSelection, selectAll, hasSelection, selectedCount } = useTransactionSelection();
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { confirmState, showConfirmation, hideConfirmation, startDeleting } = useDeleteConfirmation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editModalTransaction, setEditModalTransaction] = useState<TransactionItem | null>(null);
  const [selectionBeforeEdit, setSelectionBeforeEdit] = useState<Set<string>>(new Set());

  const handleDelete = (ids: string[]) => {
    showConfirmation(ids);
  };

  const handleConfirmedDelete = async () => {
    if (confirmState.transactionIds.length === 0) return;
    
    startDeleting();

    try {
      await deleteTransactions(confirmState.transactionIds);
      
      showToast(
        `Successfully deleted ${confirmState.transactionCount} transaction${confirmState.transactionCount !== 1 ? 's' : ''}`,
        'success'
      );
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-sum'] });
      queryClient.invalidateQueries({ queryKey: ['account-balances'] });
      
      clearSelection();
      hideConfirmation();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete transactions';
      showToast(message, 'error');
      hideConfirmation();
    }
  };
  
  const handleEdit = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setSelectionBeforeEdit(new Set(selectedRows));
      clearSelection();
      setEditModalTransaction(transaction);
    }
  };

  const handleDoubleClick = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setSelectionBeforeEdit(new Set(selectedRows));
      clearSelection();
      setEditModalTransaction(transaction);
    }
  };

  const handleModalCancel = () => {
    setSelectedRows(selectionBeforeEdit);
    setEditModalTransaction(null);
    setSelectionBeforeEdit(new Set());
  };

  const handleModalSave = () => {
    setEditModalTransaction(null);
    setSelectionBeforeEdit(new Set());
  };

  const handleSelectAll = () => hasSelection ? clearSelection() : selectAll(transactions.map(t => t.id));

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    showContextMenu(e, id, selectedRows);
  };

  const handleSelection = (id: string) => {
    toggleSelection(id);
  };

  const setSelectedRows = (newSelection: Set<string>) => {
    clearSelection();
    if (newSelection.size > 0) {
      const idsArray = Array.from(newSelection);
      idsArray.forEach(id => toggleSelection(id));
    }
  };

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <p className="text-red-600">Error loading transactions: {error.message}</p>
      </div>
    );
  }

  if (!isFetching && transactions.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 table-fixed" style={{tableLayout: 'fixed'}}>
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="p-0" style={{width: '40px'}}>
                        <input 
                            type="checkbox" 
                            checked={hasSelection && selectedCount === transactions.length && transactions.length > 0} 
                            onChange={handleSelectAll} 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={transactions.length === 0 || editingRowId !== null}
                        />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '110px'}}>Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '90px'}}>Gross</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '90px'}}>Net</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '90px'}}>VAT</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '160px'}}>Category Group</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '130px'}}>Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '130px'}}>Account</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider" style={{width: '130px'}}>Business Reference</th>
                </tr>
            </thead>
            <tbody className={`bg-white divide-y divide-gray-200 transition-opacity duration-300 ${
                isFetching ? 'opacity-40' : 'opacity-100'
            }`}>
                {transactions.map((transaction) => {
                  const isEditing = editingRowId === transaction.id;
                  const isSelected = selectedRows.has(transaction.id);
                  const isActive = contextMenu.isVisible && contextMenu.targetRowIds.includes(transaction.id);
  
  return (
    <TransactionRow
      key={`display-${transaction.id}`}  // Different key for display mode
      transaction={transaction}
      isSelected={isSelected}
      isActive={isActive}
      onSelect={handleSelection}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    />
  );
})}
            </tbody>
        </table>
      </div>

      {isFetching && (
        <div className="absolute top-4 right-4">
          <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin shadow-inner"></div>
        </div>
      )}

      <ContextMenu 
        isVisible={contextMenu.isVisible} 
        x={contextMenu.x} 
        y={contextMenu.y} 
        targetRowIds={contextMenu.targetRowIds} 
        onClose={hideContextMenu} 
        onDelete={handleDelete} 
        onEdit={handleEdit}
      />
      
      <DeleteConfirmationModal 
        isOpen={confirmState.isOpen} 
        transactionCount={confirmState.transactionCount} 
        onConfirm={handleConfirmedDelete} 
        onCancel={hideConfirmation} 
        isDeleting={confirmState.isDeleting}
      />

      <TransactionEditModal
        key={editModalTransaction?.id}
        transaction={editModalTransaction}
        isOpen={editModalTransaction !== null}
        onClose={handleModalCancel}
        onSave={handleModalSave}
      />
    </div>
  );
}