"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X, RotateCcw } from 'lucide-react';
import { useSimpleExpenseForm } from "@/forms/simple-expense/hooks/useSimpleExpenseForm";

const SimpleExpenseForm = () => {
  const {
    fields: formData,
    errors,
    isSubmitting,
    submit,
    reset,
    handlers: { handleFieldChange, handleAmountChange },
    dataSources: { accounts, categoryGroups, availableCategories },
  } = useSimpleExpenseForm();

  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    account: string;
    category_group: string;
    category: string;
    gross_amount: string;
  } | null>(null);

  const resetField = (field: keyof typeof formData) => {
    handleFieldChange(field, '');
  };

  const resetForm = () => {
    reset();
    setSubmitStatus(null);
    setLastSubmitted(null);
  };

  const handleSubmit = async () => {
    await submit();

    // Optimistically mark as success (hook enhancement later)
    setSubmitStatus('success');
    setLastSubmitted({
      account: formData.account,
      category_group: formData.category_group,
      category: formData.category,
      gross_amount: formData.gross_amount,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Transaction
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="space-y-6">
            
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                account
              </label>
              <select
                value={formData.account}
                onChange={(e) => handleFieldChange('account', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.account ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select account...</option>
                {accounts.map(account => (
                  <option key={account.value} value={account.value}>
                    {account.label}
                  </option>
                ))}
              </select>
              {errors.account && (
                <p className="mt-1 text-sm text-red-600">{errors.account}</p>
              )}
            </div>

            {/* Category Group Selection (Primary) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                category_group
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.category_group}
                  onChange={(e) => handleFieldChange('category_group', e.target.value)}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.category_group ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">All groups (show all categories)</option>
                  {categoryGroups.map(group => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
                {formData.category_group && (
                  <button
                    type="button"
                    onClick={() => resetField('category_group')}
                    className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Clear category group"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              {formData.category_group === 'other' && (
                <input
                  type="text"
                  value={formData.custom_category_group}
                  onChange={(e) => handleFieldChange('custom_category_group', e.target.value)}
                  placeholder="Enter custom category group..."
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              )}
              
              {errors.category_group && (
                <p className="mt-1 text-sm text-red-600">{errors.category_group}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use to filter categories, or gets auto-set when you select a category
              </p>
            </div>

            {/* Category Selection (Secondary) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                category {formData.category && formData.category !== 'other' && <span className="text-xs text-gray-500">(auto-sets group)</span>}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category...</option>
                  {availableCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.value}
                    </option>
                  ))}
                </select>
                {formData.category && (
                  <button
                    type="button"
                    onClick={() => resetField('category')}
                    className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Clear category"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              {formData.category === 'other' && (
                <input
                  type="text"
                  value={formData.custom_category}
                  onChange={(e) => handleFieldChange('custom_category', e.target.value)}
                  placeholder="Enter custom category..."
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              )}
              
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {availableCategories.length} categories available
                {formData.category_group && formData.category_group !== 'other' && ` (filtered by ${formData.category_group})`}
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                gross_amount (zł)
              </label>
              <input
                type="text"
                value={formData.gross_amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="123.45 or 123,45"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.gross_amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.gross_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.gross_amount}</p>
              )}
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                business_timestamp
              </label>
              <input
                type="date"
                value={formData.business_timestamp}
                onChange={(e) => handleFieldChange('business_timestamp', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                onDoubleClick={(e) => {
                  const input = e.target as HTMLInputElement & { showPicker?: () => void };
                  input.showPicker?.();
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer ${
                  errors.business_timestamp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.business_timestamp && (
                <p className="mt-1 text-sm text-red-600">{errors.business_timestamp}</p>
              )}
            </div>

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
                Kategoria: <strong>{lastSubmitted.category}</strong>{lastSubmitted.category_group ? ` (${lastSubmitted.category_group})` : ''} <br />
                Konto: <strong>{lastSubmitted.account}</strong>
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

export default SimpleExpenseForm;