'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { TransactionFilters } from '@/features/transactions/types'

export function useTransactionsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const filters: TransactionFilters = {
        account: searchParams.get('account') || undefined,
        category_group: searchParams.get('category_group') || undefined,
        category: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
        date_from: searchParams.get('date_from') || undefined,
        date_to: searchParams.get('date_to') || undefined,
        date_preset: searchParams.get('date_preset') || 'month_to_date',
        amount_type: searchParams.get('amount_type') || undefined,
        sort_by: searchParams.get('sort_by') || undefined,
        sort_order: searchParams.get('sort_order') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '100'),
    }

    const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value))
            } else {
                params.delete(key)
            }
        })

        // If the update is for anything other than pagination, reset to page 1.
        if (!('page' in newFilters)) {
            params.set('page', '1')
        }

        router.push(`?${params.toString()}`)
    }, [router, searchParams])

    const resetFilters = useCallback(() => {
        router.push('?date_preset=month_to_date')
    }, [router])

    const syncWithForm = useCallback((formAccount: string) => {
        updateFilters({ account: formAccount })
    }, [updateFilters])

    return { 
        filters, 
        updateFilters, 
        resetFilters, 
        syncWithForm 
    }
}