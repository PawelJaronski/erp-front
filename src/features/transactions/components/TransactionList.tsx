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
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">Gross</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">Net</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">VAT</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Category Group</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Account</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Business Reference</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.business_timestamp).toLocaleDateString()}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${(transaction.gross_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.gross_amount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{transaction.net_amount?.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{transaction.vat_amount?.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category_group}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.account}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.business_reference}</td>
                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}