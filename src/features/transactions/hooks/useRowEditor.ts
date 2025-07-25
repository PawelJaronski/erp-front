import { useState, useCallback, useEffect } from 'react';
import { TransactionItem } from '@/features/transactions/types';
import { updateTransaction, TransactionUpdateData } from '@/features/transactions/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ToastProvider';
import { filterCategories } from '@/features/transactions/utils/categoryFiltering';

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
  [key: string]: boolean;
}

export function useRowEditor(transaction: TransactionItem) {
    console.log('useRowEditor initialized for transaction:', transaction.id, transaction);

    
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(true);
  const [editedData, setEditedData] = useState<EditedData>({
    event_type: transaction.event_type,
    category_group: transaction.category_group,
    category: transaction.category,
    account: transaction.account,
    gross_amount: transaction.gross_amount?.toString() || '',
    net_amount: transaction.net_amount?.toString() || '',
    vat_amount: transaction.vat_amount?.toString() || '',
    business_timestamp: new Date(transaction.business_timestamp).toISOString().split('T')[0],
    business_reference: transaction.business_reference || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field order for tab navigation
  const fields = [
    'business_timestamp', 'gross_amount', 'net_amount', 'vat_amount', 
    'category_group', 'category', 'account', 'business_reference'
  ];

  // Get available categories based on selected category group
  const availableCategories = filterCategories({
    categoryGroup: editedData.category_group,
    category: editedData.category,
  });

  const validateField = useCallback((field: string, value: string): boolean => {
    const requiredFields = ['business_timestamp', 'gross_amount', 'category_group', 'category', 'account'];
    return requiredFields.includes(field) ? value.trim() !== '' : true;
  }, []);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const fieldValue = editedData[field as keyof EditedData];
      if (!validateField(field, fieldValue)) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [editedData, validateField, fields]);

  const updateField = useCallback((field: keyof EditedData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field becomes valid
    if (validateField(field, value)) {
      setErrors(prev => ({ ...prev, [field]: false }));
    } else {
      setErrors(prev => ({ ...prev, [field]: true }));
    }
  }, [validateField]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          setCurrentFieldIndex(prev => Math.max(0, prev - 1));
        } else {
          setCurrentFieldIndex(prev => Math.min(fields.length - 1, prev + 1));
        }
        break;
      
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        handleSave();
        break;
      
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
        break;
    }
  }, [fields.length]);

  const hasChanges = useCallback((): boolean => {
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
  }, [editedData, transaction]);

  const handleSave = useCallback(async () => {
    if (!validateAll()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
  
    if (!hasChanges()) {
      setIsEditing(false);
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
      
      // Get all transaction-related queries and invalidate them
      await queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false // This will invalidate all queries that start with ['transactions']
      });
      await queryClient.invalidateQueries({ queryKey: ['transactions-sum'] });
      await queryClient.invalidateQueries({ queryKey: ['account-balances'] });
      
      showToast('Transaction updated successfully', 'success');
      setIsEditing(false);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      showToast(message, 'error');
      
      // Invalidate on error to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAll, hasChanges, editedData, transaction, queryClient, showToast]);

  const handleCancel = useCallback(() => {
    // Reset to original data
    setEditedData({
      event_type: transaction.event_type,
      category_group: transaction.category_group,
      category: transaction.category,
      account: transaction.account,
      gross_amount: transaction.gross_amount?.toString() || '',
      net_amount: transaction.net_amount?.toString() || '',
      vat_amount: transaction.vat_amount?.toString() || '',
      business_timestamp: new Date(transaction.business_timestamp).toISOString().split('T')[0],
      business_reference: transaction.business_reference || '',
    });
    setErrors({});
    setCurrentFieldIndex(0);
    setIsEditing(false);
  }, [transaction]);



  return {
    isEditing,
    editedData,
    errors,
    currentFieldIndex,
    isSubmitting,
    availableCategories,
    updateField,
    handleKeyDown,
    handleSave,
    handleCancel,
    hasChanges: hasChanges()
  };
}