import React, { useState, useEffect, useRef } from 'react';
import { TransactionItem } from '@/features/transactions/types';
import { updateTransaction, TransactionUpdateData } from '@/features/transactions/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ToastProvider';
import { filterCategories } from '@/features/transactions/utils/categoryFiltering';
import { AccountSelect, CategoryGroupSelect, CategorySelect } from '@/features/transactions/components';
import { DateInput } from '@/shared/components/form/DateInput';
import { FormField } from '@/shared/components/form/FormField';

interface EditedData {
  event_type: string;
  category_group: string;
  category: string;
  account: string;
  gross_amount: string;
  net_amount: string;
  vat_amount: string;
  business_timestamp: string;
  business_reference: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface TransactionEditModalProps {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TransactionEditModal({ transaction, isOpen, onClose, onSave }: TransactionEditModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Initialize form data directly from transaction prop - no useEffect needed!
  const getInitialData = (): EditedData => {
    if (!transaction) {
      return {
        event_type: '',
        category_group: '',
        category: '',
        account: '',
        gross_amount: '',
        net_amount: '',
        vat_amount: '',
        business_timestamp: '',
        business_reference: '',
      };
    }
    
    return {
      event_type: transaction.event_type,
      category_group: transaction.category_group,
      category: transaction.category,
      account: transaction.account,
      gross_amount: transaction.gross_amount?.toString() || '',
      net_amount: transaction.net_amount?.toString() || '',
      vat_amount: transaction.vat_amount?.toString() || '',
      business_timestamp: new Date(transaction.business_timestamp).toISOString().split('T')[0],
      business_reference: transaction.business_reference || '',
    };
  };

  const [editedData, setEditedData] = useState<EditedData>(getInitialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get available categories based on selected category group
  const availableCategories = filterCategories({
    categoryGroup: editedData.category_group,
    category: editedData.category,
  });

  // Check if form has changes
  const hasChanges = (): boolean => {
    if (!transaction) return false;
    
    return (
      editedData.event_type !== transaction.event_type ||
      editedData.category_group !== transaction.category_group ||
      editedData.category !== transaction.category ||
      editedData.account !== transaction.account ||
      editedData.gross_amount !== (transaction.gross_amount?.toString() || '') ||
      editedData.net_amount !== (transaction.net_amount?.toString() || '') ||
      editedData.vat_amount !== (transaction.vat_amount?.toString() || '') ||
      editedData.business_timestamp !== new Date(transaction.business_timestamp).toISOString().split('T')[0] ||
      editedData.business_reference !== (transaction.business_reference || '')
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!editedData.business_timestamp.trim()) {
      newErrors.business_timestamp = 'Date is required';
    }
    if (!editedData.gross_amount.trim()) {
      newErrors.gross_amount = 'Amount is required';
    }
    if (!editedData.category_group.trim()) {
      newErrors.category_group = 'Category group is required';
    }
    if (!editedData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!editedData.account.trim()) {
      newErrors.account = 'Account is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update field value
  const updateField = (field: keyof EditedData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!transaction || !validateForm()) {
      return;
    }

    if (!hasChanges()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload: TransactionUpdateData = {};
      
      // Only include changed fields
      if (editedData.event_type !== transaction.event_type) {
        updatePayload.event_type = editedData.event_type;
      }
      if (editedData.category_group !== transaction.category_group) {
        updatePayload.category_group = editedData.category_group;
      }
      if (editedData.category !== transaction.category) {
        updatePayload.category = editedData.category;
      }
      if (editedData.account !== transaction.account) {
        updatePayload.account = editedData.account;
      }
      if (editedData.gross_amount !== (transaction.gross_amount?.toString() || '')) {
        updatePayload.gross_amount = parseFloat(editedData.gross_amount) || 0;
      }
      if (editedData.net_amount !== (transaction.net_amount?.toString() || '')) {
        updatePayload.net_amount = parseFloat(editedData.net_amount) || undefined;
      }
      if (editedData.vat_amount !== (transaction.vat_amount?.toString() || '')) {
        updatePayload.vat_amount = parseFloat(editedData.vat_amount) || undefined;
      }
      if (editedData.business_timestamp !== new Date(transaction.business_timestamp).toISOString().split('T')[0]) {
        updatePayload.business_timestamp = editedData.business_timestamp;
      }
      if (editedData.business_reference !== (transaction.business_reference || '')) {
        updatePayload.business_reference = editedData.business_reference;
      }

      await updateTransaction(transaction.id, updatePayload);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false 
      });
      await queryClient.invalidateQueries({ queryKey: ['transactions-sum'] });
      await queryClient.invalidateQueries({ queryKey: ['account-balances'] });
      
      showToast('Transaction updated successfully', 'success');
      onSave();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with confirmation if needed
  const handleClose = () => {
    if (hasChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirmDialog, hasChanges]);

  // Focus trap for modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, showConfirmDialog]);

  if (!isOpen || !transaction) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Edit Transaction
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Date */}
            <FormField label="Date" error={errors.business_timestamp} required>
              <DateInput
                value={editedData.business_timestamp}
                onChange={(value) => updateField('business_timestamp', value)}
              />
            </FormField>

            {/* Gross Amount */}
            <FormField label="Gross Amount" error={errors.gross_amount} required>
              <input
                type="number"
                step="0.01"
                value={editedData.gross_amount}
                onChange={(e) => updateField('gross_amount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </FormField>

            {/* Net Amount */}
            <FormField label="Net Amount" error={errors.net_amount}>
              <input
                type="number"
                step="0.01"
                value={editedData.net_amount}
                onChange={(e) => updateField('net_amount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </FormField>

            {/* VAT Amount */}
            <FormField label="VAT Amount" error={errors.vat_amount}>
              <input
                type="number"
                step="0.01"
                value={editedData.vat_amount}
                onChange={(e) => updateField('vat_amount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </FormField>

            {/* Category Group */}
            <FormField label="Category Group" error={errors.category_group} required>
              <CategoryGroupSelect
                value={editedData.category_group}
                onChange={(value) => updateField('category_group', value)}
                onCustomValueChange={() => {}}
                error={errors.category_group}
              />
            </FormField>

            {/* Category */}
            <FormField label="Category" error={errors.category} required>
              <CategorySelect
                value={editedData.category}
                onChange={(value) => updateField('category', value)}
                availableCategories={availableCategories}
                onCustomValueChange={() => {}}
                error={errors.category}
              />
            </FormField>

            {/* Account */}
            <FormField label="Account" error={errors.account} required>
              <AccountSelect
                value={editedData.account}
                onChange={(value) => updateField('account', value)}
                error={errors.account}
              />
            </FormField>

            {/* Business Reference */}
            <FormField label="Business Reference" error={errors.business_reference}>
              <input
                type="text"
                value={editedData.business_reference}
                onChange={(e) => updateField('business_reference', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800">
              Unsaved Changes
            </h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}