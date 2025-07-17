'use client'

import { useTransactionsFilters } from '@/features/transactions/hooks/useTransactionFilters'
import { useTransactionsQuery } from '@/features/transactions/hooks/useTransactionsQuery'
import { AccountSelector } from '@/features/transactions/components/filters/AccountSelector'
import { DatePresetSelector } from '@/features/transactions/components/filters/DatePresetSelector'
import { AmountTypeSelector } from '@/features/transactions/components/filters/AmountTypeSelector'
import { SearchInput } from '@/features/transactions/components/filters/SearchInput'
import { TransactionList } from '@/features/transactions/components/TransactionList'
import { Pagination } from '@/features/transactions/components/Pagination'

export default function TransactionsClient() {
    const { filters, updateFilters, resetFilters, syncWithForm } = useTransactionsFilters()
    const { data, isLoading, error } = useTransactionsQuery(filters)

    const mockFormAccount = 'mbank_firmowe'

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AccountSelector
              value={filters.account}
              onChange={(account) => updateFilters({ account })}
              onSyncWithForm={() => syncWithForm(mockFormAccount)}
            />
            
            <DatePresetSelector
              value={filters.date_preset}
              onChange={(date_preset) => updateFilters({ date_preset })}
            />
            
            <SearchInput
              value={filters.search}
              onChange={(search) => updateFilters({ search })}
            />
            
            <AmountTypeSelector
              value={filters.amount_type}
              onChange={(amount_type) => updateFilters({ amount_type })}
            />
          </div>
        </div>

        {/* Results Summary */}
        {data && (
          <div className="text-sm text-gray-600">
            Found {data.total_count} transactions
          </div>
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={data?.transactions || []}
          isLoading={isLoading}
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
          />
        )}
      </div>
    )
}