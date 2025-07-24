'use client'

import { useTransactionsFilters } from '@/features/transactions/hooks/useTransactionFilters'
import { useTransactionsQuery } from '@/features/transactions/hooks/useTransactionsQuery'
import { AccountFilterSelector } from '@/features/transactions/components/list/filters/AccountFilterSelector'
import { DatePresetSelector } from '@/features/transactions/components/list/filters/DatePresetSelector'
import { AmountTypeSelector } from '@/features/transactions/components/list/filters/AmountTypeSelector'
import { SearchInput } from '@/features/transactions/components/list/filters/SearchInput'
import { TransactionList } from '@/features/transactions/components/list/TransactionList'
import { Pagination } from '@/features/transactions/components/list/Pagination'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { CategoryGroupFilterSelector } from '@/features/transactions/components/list/filters/CategoryGroupFilterSelector'
import { TransactionFormContainer } from '@/features/transactions/components/forms/TransactionFormContainer'
import React, { useState, useEffect } from 'react'
import { TransactionsSum, AccountBalancesPanel } from '@/features/transactions/components';

export default function TransactionsClient() {
    const { filters, updateFilters } = useTransactionsFilters()
    const [searchValue, setSearchValue] = React.useState(filters.search || '')
    const debouncedSearch = useDebounce(searchValue, 300)
    // Dodaj stan do obsługi "zamrożenia" listy
    const [pendingDateRange, setPendingDateRange] = useState(false);

    // Czy są aktywne filtry daty?
    const hasDateFilter = !!(filters.date_preset || (filters.date_from && filters.date_to));

    React.useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            updateFilters({ search: debouncedSearch })
        }
    }, [debouncedSearch, filters.search, updateFilters]);

    // Synchronizuj searchValue z filters.search (np. po resecie)
    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    // Pobieraj dane tylko jeśli jest filtr daty
    const { data, error, isFetching, refetch } = useTransactionsQuery(hasDateFilter ? filters : { ...filters, page: 1, limit: 50 });

    // Obsługa zmiany zakresu dat
    const handleDateRangeChange = (from: string, to: string) => {
        // Ustaw tylko zakres, wyczyść preset
        updateFilters({ date_from: from || undefined, date_to: to || undefined, date_preset: undefined });
        setPendingDateRange(false);
    };

    // Obsługa zmiany presetu
    const handlePresetChange = (preset?: string) => {
        if (preset === undefined) {
            setPendingDateRange(true);
            return;
        }
        // Ustaw tylko preset, wyczyść zakres
        updateFilters({ date_preset: preset, date_from: undefined, date_to: undefined });
    };

    // Reset filtrów przywraca preset 'month_to_date'
    const handleResetFilters = () => {
        updateFilters({
            date_preset: 'month_to_date',
            date_from: undefined,
            date_to: undefined,
            account: undefined,
            amount_type: undefined,
            category_group: undefined,
            search: undefined,
        });
        setSearchValue('');
    };

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
                  onPresetChange={handlePresetChange}
                  dateFrom={filters.date_from}
                  dateTo={filters.date_to}
                  onDateRangeChange={handleDateRangeChange}
                  pendingDateRange={pendingDateRange}
                  setPendingDateRange={setPendingDateRange}
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
              onClick={handleResetFilters}
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

        {/* Komunikat jeśli brak filtra daty */}
        {!hasDateFilter && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4 rounded">
            Wybierz zakres dat lub preset, aby zobaczyć transakcje.
          </div>
        )}

        {/* Pagination, suma, lista tylko jeśli jest filtr daty */}
        {hasDateFilter && data && data.total_count > 0 && (
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
        {hasDateFilter && <TransactionsSum filters={filters} />}
        {hasDateFilter && (
          <TransactionList
            transactions={data?.transactions || []}
            isFetching={isFetching}
            error={error}
          />
        )}
        {hasDateFilter && data && data.total_count > 0 && (
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