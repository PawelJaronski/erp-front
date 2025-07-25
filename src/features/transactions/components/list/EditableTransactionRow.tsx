import React, { useEffect, useRef } from 'react';
import { TransactionItem } from '@/features/transactions/types';
import { useRowEditor } from '@/features/transactions/hooks/useRowEditor';
import { EditableTextCell, EditableSelectCell, EditableDateCell } from './EditableCells';

interface EditableTransactionRowProps {
  transaction: TransactionItem;
  isSelected: boolean;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onCancelEdit: () => void;
}

export function EditableTransactionRow({
  transaction,
  isSelected,
  isActive = false,
  onSelect,
  onContextMenu,
  onCancelEdit
}: EditableTransactionRowProps) {
  const {
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
    hasChanges
  } = useRowEditor(transaction);

  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Focus current field when currentFieldIndex changes
  useEffect(() => {
    if (isEditing && cellRefs.current[currentFieldIndex]) {
      const cell = cellRefs.current[currentFieldIndex];
      const input = cell?.querySelector('input, .react-select__control');
      if (input && 'focus' in input) {
        (input as HTMLElement).focus();
      }
    }
  }, [currentFieldIndex, isEditing]);

  const handleCancelClick = () => {
    handleCancel();
    onCancelEdit();
  };

  if (!isEditing) {
    // Display mode - this should not be reached as parent handles display/edit toggle
    return null;
  }

  return (
    <>
      <tr className="bg-blue-50 border-2 border-blue-200">
        {/* Checkbox */}
        <td className="p-0 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(transaction.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isEditing}
          />
        </td>

        {/* Date */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[0] = el;
            }
          }}>
            <EditableDateCell
              value={editedData.business_timestamp}
              onChange={(value) => updateField('business_timestamp', value)}
              onKeyDown={handleKeyDown}
              error={errors.business_timestamp}
            />
          </div>
        </td>

        {/* Gross Amount */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[1] = el;
            }
          }}>
            <EditableTextCell
              value={editedData.gross_amount}
              onChange={(value) => updateField('gross_amount', value)}
              onKeyDown={handleKeyDown}
              error={errors.gross_amount}
              type="number"
            />
          </div>
        </td>

        {/* Net Amount */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[2] = el;
            }
          }}>
            <EditableTextCell
              value={editedData.net_amount}
              onChange={(value) => updateField('net_amount', value)}
              onKeyDown={handleKeyDown}
              error={errors.net_amount}
              type="number"
            />
          </div>
        </td>

        {/* VAT Amount */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[3] = el;
            }
          }}>
            <EditableTextCell
              value={editedData.vat_amount}
              onChange={(value) => updateField('vat_amount', value)}
              onKeyDown={handleKeyDown}
              error={errors.vat_amount}
              type="number"
            />
          </div>
        </td>

        {/* Category Group */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[4] = el;
            }
          }}>
            <EditableSelectCell
              value={editedData.category_group}
              onChange={(value) => updateField('category_group', value)}
              onKeyDown={handleKeyDown}
              type="category_group"
              error={errors.category_group}
            />
          </div>
        </td>

        {/* Category */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[5] = el;
            }
          }}>
            <EditableSelectCell
              value={editedData.category}
              onChange={(value) => updateField('category', value)}
              onKeyDown={handleKeyDown}
              type="category"
              availableCategories={availableCategories}
              error={errors.category}
            />
          </div>
        </td>

        {/* Account */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[6] = el;
            }
          }}>
            <EditableSelectCell
              value={editedData.account}
              onChange={(value) => updateField('account', value)}
              onKeyDown={handleKeyDown}
              type="account"
              error={errors.account}
            />
          </div>
        </td>

        {/* Business Reference */}
        <td className="px-2 py-2">
          <div ref={el => {
            if (el) {
              cellRefs.current[7] = el;
            }
          }}>
            <EditableTextCell
              value={editedData.business_reference}
              onChange={(value) => updateField('business_reference', value)}
              onKeyDown={handleKeyDown}
              error={errors.business_reference}
            />
          </div>
        </td>
      </tr>

      {/* Action buttons row */}
      <tr className="bg-blue-50">
        <td colSpan={9} className="px-4 py-2">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelClick}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !hasChanges}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}