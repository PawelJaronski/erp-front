import React, { useState, useEffect } from 'react';
import { DateField, AccountField, AmountField, CategoryField, CategoryGroupField, NoteField, ItemField } from '../shared/fields';
import type { TransactionItem } from '@/features/transactions/types';
import { accounts, categoryGroups, categoriesData, CategoryGroupValue } from '@/features/transactions/utils/staticData';

interface TransactionRowProps {
  transaction: TransactionItem;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, data: Partial<TransactionItem>) => void;
  onCancel: () => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function TransactionRow({
  transaction,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onSave,
  onCancel,
  onContextMenu,
}: TransactionRowProps) {
  const [draft, setDraft] = useState<TransactionItem>(transaction);

  useEffect(() => {
    setDraft(transaction);
  }, [transaction, isEditing]);

  return (
    <tr onContextMenu={e => onContextMenu(e, transaction.id)} className={isEditing ? 'bg-yellow-50' : ''}>
      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <DateField
            label=""
            value={draft.business_timestamp}
            onChange={v => setDraft({ ...draft, business_timestamp: v })}
            inline
          />
        ) : (
          new Date(transaction.business_timestamp).toLocaleDateString()
        )}
      </td>
      {/* Gross */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${(transaction.gross_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {isEditing ? (
          <AmountField
            label=""
            value={draft.gross_amount !== null ? draft.gross_amount.toString() : ''}
            onChange={v => setDraft({ ...draft, gross_amount: v === '' ? null : parseFloat(v.replace(',', '.')) })}
            inline
          />
        ) : (
          transaction.gross_amount?.toFixed(2)
        )}
      </td>
      {/* Net */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
        {transaction.net_amount?.toFixed(2)}
      </td>
      {/* VAT */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
        {transaction.vat_amount?.toFixed(2)}
      </td>
      {/* Category Group */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <CategoryGroupField
            label=""
            value={draft.category_group as CategoryGroupValue}
            onChange={v => setDraft({ ...draft, category_group: v as CategoryGroupValue })}
            inline
          />
        ) : (
          transaction.category_group
        )}
      </td>
      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <CategoryField
            label=""
            value={draft.category}
            onChange={v => setDraft({ ...draft, category: v })}
            availableCategories={categoriesData}
            inline
          />
        ) : (
          transaction.category
        )}
      </td>
      {/* Account */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {isEditing ? (
          <AccountField
            label=""
            value={draft.account}
            onChange={v => setDraft({ ...draft, account: v })}
            inline
          />
        ) : (
          transaction.account
        )}
      </td>
      {/* Business Reference */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <input
            type="text"
            value={draft.business_reference ?? ''}
            onChange={e => setDraft({ ...draft, business_reference: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        ) : (
          transaction.business_reference
        )}
      </td>
      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        {isEditing ? (
          <>
            <button className="mr-2 text-green-700 font-semibold" onClick={() => onSave(transaction.id, draft)}>Save</button>
            <button className="text-gray-500" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <button className="text-blue-600 font-semibold" onClick={() => onEdit(transaction.id)}>Edit</button>
        )}
      </td>
    </tr>
  );
}
