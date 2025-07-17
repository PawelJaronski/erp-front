'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '@/features/transactions/api'
import { TransactionFilters } from '@/features/transactions/types'

export function useTransactionsQuery(filters: TransactionFilters) {
    return useQuery({
        queryKey: [
            'transactions',
            filters.account,
            filters.category_group,
            filters.category,
            filters.search,
            filters.date_from,
            filters.date_to,
            filters.date_preset,
            filters.amount_type,
            filters.sort_by,
            filters.sort_order,
            filters.page,
            filters.limit,
        ],
        queryFn: () => fetchTransactions(filters),
        enabled: true,
    })
}