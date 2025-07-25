import React from 'react';
import { TransactionItem } from '@/features/transactions/types';

interface TransactionRowProps {
  transaction: TransactionItem;
  isSelected: boolean;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onDoubleClick: (id: string) => void;
}

export function TransactionRow({
  transaction,
  isSelected,
  isActive = false,
  onSelect,
  onContextMenu,
  onDoubleClick
}: TransactionRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    // Empty - only checkbox handles selection
  };

  const handleDoubleClick = () => {
    onDoubleClick(transaction.id);
  };

  const handleCheckboxChange = () => {
    onSelect(transaction.id);
  };

  return (
    <tr
      className={`cursor-pointer ${
        isActive || isSelected
          ? 'bg-blue-50 hover:bg-blue-100'
          : 'hover:bg-gray-50'
      }`}
      onClick={handleRowClick}
      onContextMenu={(e) => onContextMenu(e, transaction.id)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Checkbox column */}
      <td className="p-0 text-center" style={{width: '40px', padding: 0}}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(transaction.business_timestamp).toLocaleDateString()}
      </td>
      {/* Gross Amount */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
        (transaction.gross_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.gross_amount?.toFixed(2)}
      </td>
      {/* Net Amount */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.net_amount?.toFixed(2)}
      </td>
      {/* VAT Amount */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.vat_amount?.toFixed(2)}
      </td>
      {/* Category Group */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all">
        {transaction.category_group}
      </td>
      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all">
        {transaction.category}
      </td>
      {/* Account */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {transaction.account}
      </td>
      {/* Business Reference */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all max-w-[130px]">
        {transaction.business_reference}
      </td>
    </tr>
  );
}