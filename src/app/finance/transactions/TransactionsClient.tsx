'use client'

import { useTransactionsFilters } from '@/features/transactions/hooks/useTransactionFilters'
import { useTransactionsQuery } from '@/features/transactions/hooks/useTransactionsQuery'
import { AccountFilterSelector } from '@/features/transactions/components/filters/AccountFilterSelector'
import { DatePresetSelector } from '@/features/transactions/components/filters/DatePresetSelector'
import { AmountTypeSelector } from '@/features/transactions/components/filters/AmountTypeSelector'
import { SearchInput } from '@/features/transactions/components/filters/SearchInput'
import { TransactionList } from '@/features/transactions/components/TransactionList'
import { Pagination } from '@/features/transactions/components/Pagination'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { CategoryGroupFilterSelector } from '@/features/transactions/components/filters/CategoryGroupFilterSelector'
import { TransactionFormContainer } from '@/features/transactions/components/TransactionFormContainer'
import React from 'react'
import { TransactionsSum, AccountBalancesPanel } from '@/features/transactions/components';

export default function TransactionsClient() {
    const { filters, updateFilters, resetFilters } = useTransactionsFilters()
    const [searchValue, setSearchValue] = React.useState(filters.search || '')
    const debouncedSearch = useDebounce(searchValue, 300)

    React.useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            updateFilters({ search: debouncedSearch })
        }
    }, [debouncedSearch, filters.search, updateFilters]);

    const { data, error, isFetching, refetch } = useTransactionsQuery(filters)

    React.useEffect(() => {
      if (!filters.date_preset) {
        updateFilters({ date_preset: 'month_to_date' })
      }
    }, [filters.date_preset, updateFilters])

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <TransactionFormContainer 
        onSuccess={refetch} 
        collapsible={true} 
        className="bg-white rounded-lg p-8 mb-8 mx-auto"
        columns={3}
         />
        
        {/* Filters + Account Balances */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Filtry: 2/3 szerokości na desktopie */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AccountFilterSelector
                  value={filters.account}
                  onChange={(account) => updateFilters({ account })}
                />
                <DatePresetSelector
                  value={filters.date_preset}
                  onChange={(date_preset) => updateFilters({ date_preset })}
                />
                <SearchInput
                  value={searchValue}
                  onChange={(search) => setSearchValue(search || '')}
                />
                <AmountTypeSelector
                  value={filters.amount_type}
                  onChange={(amount_type) => updateFilters({ amount_type })}
                />
                <CategoryGroupFilterSelector
                  value={filters.category_group}
                  onChange={(category_group) => updateFilters({ category_group })}
                />
              </div>
              <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => resetFilters()}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>
            </div>
            {/* Stany kont: 1/3 szerokości na desktopie */}
            <div className="lg:col-span-1">
              <AccountBalancesPanel />
            </div>
          </div>
        </div>

        {/* Pagination */}
        {data && data.total_count > 0 && (
          <Pagination
            currentPage={filters.page || 1}
            totalCount={data.total_count}
            limit={filters.limit || 50}
            hasNext={data.has_next}
            hasPrevious={data.has_previous}
            onPageChange={(page) => updateFilters({ page })}
            showSummary={true}
          />
        )}

        {/* Transactions Sum */}
        <TransactionsSum filters={filters} />

        {/* Transaction List */}
        <TransactionList
          transactions={data?.transactions || []}
          isFetching={isFetching}
          error={error}
        />

        {/* Pagination */}
        {data && data.total_count > 0 && (
          <Pagination
            currentPage={filters.page || 1}
            totalCount={data.total_count}
            limit={filters.limit || 50}
            hasNext={data.has_next}
            hasPrevious={data.has_previous}
            onPageChange={(page) => updateFilters({ page })}
            showSummary={false}
          />
        )}
      </div>
    )
}