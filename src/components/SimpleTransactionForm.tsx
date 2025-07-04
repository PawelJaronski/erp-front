"use client";

import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X, RotateCcw, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { useSimpleTransactionForm } from "@/forms/simple-transaction-form/hooks/useSimpleTransactionForm";

const SimpleTransactionForm = () => {
  const {
    fields: formData,
    errors,
    isSubmitting,
    submit,
    reset: resetFormFromHook,
    handlers: { handleFieldChange, handleAmountChange, handleBooleanChange, handleNumberChange },
    dataSources: { accounts, categoryGroups, availableCategories, salesData, salesLoading },
  } = useSimpleTransactionForm();

  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    account: string;
    to_account?: string;
    category_group?: string;
    category?: string;
    gross_amount: string;
    transaction_type: string;
    transfer_date?: string;
    sales_date?: string;
    paynow_transfer?: string;
    autopay_transfer?: string;
  } | null>(null);

  const isSimpleTransfer = formData.transaction_type === "simple_transfer";
  const isBrokerTransfer = formData.transaction_type === "payment_broker_transfer";
  const isTransfer = isSimpleTransfer || isBrokerTransfer;

  // Helper parsing for broker commission preview
  const parseAmount = (val?: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/\s/g, "").replace(/,/g, ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const paynowValue = parseAmount(formData.paynow_transfer);
  const autopayValue = parseAmount(formData.autopay_transfer);
  const transfersSum = paynowValue + autopayValue;

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  const salesTotal = salesData?.total ?? null;
  const commissionPreview = salesTotal !== null ? salesTotal - transfersSum : null;

  const resetField = (field: keyof typeof formData) => {
    handleFieldChange(field, '');
  };

  const resetForm = () => {
    resetFormFromHook();
    setSubmitStatus(null);
    setLastSubmitted(null);
  };

  const handleSubmit = async () => {
    const success = await submit();

    if (success) {
      setSubmitStatus('success');
      setLastSubmitted({
        account: formData.account,
        to_account: formData.to_account,
        category_group: formData.category_group,
        category: formData.category,
        gross_amount: formData.gross_amount,
        transaction_type: formData.transaction_type,
        transfer_date: formData.transfer_date,
        sales_date: formData.sales_date,
        paynow_transfer: formData.paynow_transfer,
        autopay_transfer: formData.autopay_transfer,
      });
    } else {
      // Only show error banner if there are no validation errors (server/network)
      if (Object.keys(errors).length === 0) {
        setSubmitStatus('error');
      } else {
        setSubmitStatus(null);
      }
    }
  };

  // Native date input for simple UX & localization
  const DateInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Trigger the native date picker if the browser exposes the non-standard `showPicker()` API.
    const openPicker = () => {
      const node = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
      // In supporting browsers (e.g. Chromium) call `showPicker()`; ignore otherwise.
      node?.showPicker?.();
    };

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onDoubleClick={openPicker}
          className="w-full pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            tabIndex={0}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            title="Clear date"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button
          type="button"
          onClick={openPicker}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}

        {/* Form */}
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* transaction_type row */}
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                transaction_type
              </label>
              <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="transaction_type"
                    value="simple_expense"
                    checked={formData.transaction_type === "simple_expense"}
                    onChange={(e) => handleFieldChange('transaction_type', e.target.value)}
                    className="mr-2"
                  />
                  <span>expense</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="transaction_type"
                    value="simple_income"
                    checked={formData.transaction_type === "simple_income"}
                    onChange={(e) => handleFieldChange('transaction_type', e.target.value)}
                    className="mr-2"
                  />
                  <span>income</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="transaction_type"
                    value="simple_transfer"
                    checked={formData.transaction_type === "simple_transfer"}
                    onChange={(e) => handleFieldChange('transaction_type', e.target.value)}
                    className="mr-2"
                  />
                  <span>transfer</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="transaction_type"
                    value="payment_broker_transfer"
                    checked={formData.transaction_type === "payment_broker_transfer"}
                    onChange={(e) => handleFieldChange('transaction_type', e.target.value)}
                    className="mr-2"
                  />
                  <span>broker transfer</span>
                </label>
              </div>
            </div>

            {/* Account (and optional to_account) row – hidden for broker transfer */}
            {!isBrokerTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isTransfer ? 'from_account' : 'account'}
                </label>
                <div className="relative">
                  <select
                    value={formData.account}
                    onChange={(e) => handleFieldChange('account', e.target.value)}
                    className={`w-full appearance-none pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${errors.account ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  >
                    <option value="">Select account...</option>
                    {accounts.map(account => (
                      <option key={account.value} value={account.value}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <button
                    type="button"
                    tabIndex={formData.account ? 0 : -1}
                    onClick={() => resetField('account')}
                    className={`absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${formData.account ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                    title="Clear account"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {errors.account && (
                  <p className="mt-1 text-sm text-red-600">{errors.account}</p>
                )}
              </div>
              {isSimpleTransfer && (
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    to_account
                  </label>
                  <div className="relative">
                    <select
                      value={formData.to_account || ''}
                      onChange={(e) => handleFieldChange('to_account', e.target.value)}
                      className={`w-full appearance-none pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${errors.to_account ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">Select account...</option>
                      {accounts.map(account => (
                        <option key={account.value} value={account.value}>
                          {account.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <button
                      type="button"
                      tabIndex={formData.to_account ? 0 : -1}
                      onClick={() => resetField('to_account')}
                      className={`absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${formData.to_account ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                      title="Clear to_account"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  {errors.to_account && (
                    <p className="mt-1 text-sm text-red-600">{errors.to_account}</p>
                  )}
                </div>
              )}
            </div>
            )}

            {/* category row – invisible placeholder when transfer/broker transfer to avoid layout jump */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isTransfer ? 'h-0 overflow-hidden opacity-0 pointer-events-none select-none' : ''}`}>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  category_group
                </label>
                <div className="relative">
                  <select
                    value={formData.category_group}
                    onChange={(e) => handleFieldChange('category_group', e.target.value)}
                    className={`w-full appearance-none pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors truncate ${errors.category_group ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  >
                    <option value="">All groups (show all categories)</option>
                    {categoryGroups.map(group => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <button
                    type="button"
                    tabIndex={formData.category_group ? 0 : -1}
                    onClick={() => resetField('category_group')}
                    className={`absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${formData.category_group ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                    title="Clear category group"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {formData.category_group === 'other' && (
                  <input
                    type="text"
                    value={formData.custom_category_group}
                    onChange={(e) => handleFieldChange('custom_category_group', e.target.value)}
                    placeholder="Enter custom category group..."
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                )}
                {errors.category_group && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_group}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className={`w-full appearance-none pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors truncate ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  >
                    <option value="">Select category...</option>
                    {availableCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <button
                    type="button"
                    tabIndex={formData.category ? 0 : -1}
                    onClick={() => resetField('category')}
                    className={`absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${formData.category ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                    title="Clear category"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {formData.category === 'other' && (
                  <input
                    type="text"
                    value={formData.custom_category}
                    onChange={(e) => handleFieldChange('custom_category', e.target.value)}
                    placeholder="Enter custom category..."
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                )}
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* gross_amount + business_reference in one row – hidden for broker transfer */}
            {!isBrokerTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  gross_amount (zł)
                </label>
                <input
                  type="text"
                  value={formData.gross_amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="123.45 or 123,45"
                  className={`w-full px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${errors.gross_amount ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.gross_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.gross_amount}</p>
                )}
              </div>
              {!isBrokerTransfer && (
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    business_reference
                  </label>
                  <input
                    type="text"
                    value={formData.business_reference || ""}
                    onChange={(e) => handleFieldChange('business_reference', e.target.value)}
                    placeholder="Invoice number, order ID, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
            )}

            {/* item + note row hidden for broker transfer */}
            {!isBrokerTransfer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    item
                  </label>
                  <input
                    type="text"
                    value={formData.item || ""}
                    onChange={(e) => handleFieldChange('item', e.target.value)}
                    placeholder="What was purchased/sold"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    note
                  </label>
                  <input
                    type="text"
                    value={formData.note || ""}
                    onChange={(e) => handleFieldChange('note', e.target.value)}
                    placeholder="Additional details"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* include_vat (switch) + business_timestamp in one row – hidden for broker transfer */}
            {!isBrokerTransfer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className={`flex flex-col ${isTransfer ? 'h-0 overflow-hidden opacity-0 pointer-events-none select-none' : ''}`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    include_vat
                  </label>
                  {/* Layout: vertical on mobile (rates under switch), horizontal on md+ */}
                  <div className="flex flex-col md:flex-row items-start gap-2 md:gap-2">
                    <button
                      type="button"
                      aria-pressed={formData.include_tax}
                      onClick={() => handleBooleanChange('include_tax', !formData.include_tax)}
                      className={`relative inline-flex h-8 w-16 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-0 ${formData.include_tax ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${formData.include_tax ? 'translate-x-8' : 'translate-x-0'}`}
                      />
                    </button>

                    {/* VAT rate buttons – show only when VAT included */}
                    {formData.include_tax && (
                      <div className="flex gap-2 mt-2 md:mt-0">
                        {[0, 5, 8, 23].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            tabIndex={0}
                            onClick={() => handleNumberChange('tax_rate', rate)}
                            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 cursor-pointer ${
                              formData.tax_rate === rate
                                ? 'bg-blue-600 text-white border-blue-700'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                            }`}
                          >
                            {rate}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    business_timestamp
                  </label>
                  <DateInput
                    value={formData.business_timestamp}
                    onChange={(val) => handleFieldChange('business_timestamp', val)}
                  />
                  {errors.business_timestamp && (
                    <p className="mt-1 text-sm text-red-600">{errors.business_timestamp}</p>
                  )}
                </div>
              </div>
            )}

            {/* Broker-specific fields – only dates for now */}
            {isBrokerTransfer && (
              <>
                {/* paynow_transfer & autopay_transfer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      paynow_transfer (zł)
                    </label>
                    <input
                      type="text"
                      value={formData.paynow_transfer || ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9,.-]/g, '');
                        handleFieldChange('paynow_transfer', clean);
                      }}
                      placeholder="0,00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                     />
                    {errors.paynow_transfer && (
                      <p className="mt-1 text-sm text-red-600">{errors.paynow_transfer}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      autopay_transfer (zł)
                    </label>
                    <input
                      type="text"
                      value={formData.autopay_transfer || ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9,.-]/g, '');
                        handleFieldChange('autopay_transfer', clean);
                      }}
                      placeholder="0,00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                     />
                    {errors.autopay_transfer && (
                      <p className="mt-1 text-sm text-red-600">{errors.autopay_transfer}</p>
                    )}
                  </div>
                </div>

                {/* transfer_date & sales_date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      transfer_date
                    </label>
                    <DateInput
                      value={formData.transfer_date || ''}
                      onChange={(val) => handleFieldChange('transfer_date', val)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      sales_date
                    </label>
                    <DateInput
                      value={formData.sales_date || ''}
                      onChange={(val) => handleFieldChange('sales_date', val)}
                    />
                  </div>
                </div>

                {/* Sales summary & commission preview */}
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                  {salesLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-600">Fetching sales…</span>
                    </>
                  ) : salesTotal !== null ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        Sprzedaż za <strong>{formatDate(formData.sales_date)}</strong>: <strong>{salesTotal.toFixed(2)} zł</strong>
                      </p>
                      <p>
                        Suma przelewów: <strong>{transfersSum.toFixed(2)} zł</strong>
                      </p>
                      <p>
                        Prowizja:{' '}
                        <strong>{commissionPreview!.toFixed(2)} zł</strong>
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">Brak danych o sprzedaży (wybierz datę)</span>
                  )}
                </div>
              </>
            )}

            {/* Submit and Reset Buttons */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={resetForm}
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && lastSubmitted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            <div>
            <p className="text-green-800 font-medium">
                Transakcja została dodana pomyślnie.
            </p>
            <p className="text-sm text-gray-700 mt-1">
                Kwota: <strong>{lastSubmitted.gross_amount} zł</strong> <br />
                {lastSubmitted.transaction_type === 'simple_transfer' ? (
                  <>Konto: <strong>{lastSubmitted.account}</strong> → <strong>{lastSubmitted.to_account}</strong><br /></>
                ) : (
                  <>Kategoria: <strong>{lastSubmitted.category}</strong>{lastSubmitted.category_group ? ` (${lastSubmitted.category_group})` : ''} <br />
                  Konto: <strong>{lastSubmitted.account}</strong><br /></>
                )}
            </p>
            </div>
        </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">
              Error adding transaction. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTransactionForm;