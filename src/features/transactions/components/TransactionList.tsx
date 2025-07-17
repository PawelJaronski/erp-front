'use client'

import { TransactionItem } from '@/features/transactions/types'

interface TransactionListProps {
    transactions: TransactionItem[]
    isLoading: boolean
    error: Error | null
}

export function TransactionList({ transactions, isLoading, error }: TransactionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-red-600">Error loading transactions: {error.message}</p>
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No transactions found</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{transaction.account}</span>
                <span className="text-sm text-gray-500">{transaction.category_group}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{transaction.category}</span>
              </div>
              
              {transaction.business_reference && (
                <p className="text-sm text-gray-600 mb-1">{transaction.business_reference}</p>
              )}
              
              <p className="text-xs text-gray-400">
                {new Date(transaction.business_timestamp).toLocaleDateString()} • {transaction.event_type}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`font-medium ${
                (transaction.gross_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.gross_amount?.toFixed(2)} zł
              </div>
              
              {transaction.net_amount && transaction.vat_amount && (
                <div className="text-xs text-gray-500">
                  Net: {transaction.net_amount.toFixed(2)} • VAT: {transaction.vat_amount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    )
}