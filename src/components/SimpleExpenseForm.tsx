"use client";

import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X, RotateCcw } from 'lucide-react';


const TransactionForm = () => {
  const [formData, setFormData] = useState({
    account: '',
    category_group: '',
    category: '',
    gross_amount: '',
    business_timestamp: new Date().toISOString().split('T')[0], // Today's date as default
    custom_category_group: '',
    custom_category: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [lastSubmitted, setLastSubmitted] = useState(null);

  // Real business data from your CSV
  const accounts = [
    { value: 'mbank_firmowe', label: 'mbank_firmowe' },
    { value: 'mbank_osobiste', label: 'mbank_osobiste' },
    { value: 'cash', label: 'cash' },
    { value: 'sumup', label: 'sumup' },
  ];

  // Category groups for cost_paid event_type (with "other" option)
  const categoryGroups = [
    { value: 'cogs_printing', label: 'cogs_printing' },
    { value: 'cogs', label: 'cogs' },
    { value: 'opex', label: 'opex' },
    { value: 'taxes', label: 'taxes' },
    { value: 'other', label: 'other' },
  ];

  // All categories with their groups - from your CSV data
  const categoriesData = [
    // cogs_printing
    { value: 'calendar', group: 'cogs_printing' },
    { value: 'mug_330', group: 'cogs_printing' },
    { value: 'mug_590', group: 'cogs_printing' },
    { value: 'shipping_reflect', group: 'cogs_printing' },
    { value: 'tshirt_black', group: 'cogs_printing' },
    { value: 'tshirt_white', group: 'cogs_printing' },
    
    // cogs
    { value: 'prowizje_bramki', group: 'cogs' },
    
    // opex
    { value: 'ads', group: 'opex' },
    { value: 'biuro', group: 'opex' },
    { value: 'car_cost', group: 'opex' },
    { value: 'car_leasing', group: 'opex' },
    { value: 'credit_line_cost', group: 'opex' },
    { value: 'credit_line_payment', group: 'opex' },
    { value: 'equipment', group: 'opex' },
    { value: 'leasing', group: 'opex' },
    { value: 'loan_cost', group: 'opex' },
    { value: 'loan_payment', group: 'opex' },
    { value: 'other_opex', group: 'opex' },
    { value: 'owner_payment', group: 'opex' },
    { value: 'reconciliation', group: 'opex' },
    { value: 'services', group: 'opex' },
    { value: 'shipping', group: 'opex' },
    { value: 'software', group: 'opex' },
    { value: 'trade_fair', group: 'opex' },
    { value: 'transport', group: 'opex' },
    
    // taxes
    { value: 'psoftware', group: 'taxes' },
    { value: 'vat', group: 'taxes' },
    { value: 'zus', group: 'taxes' },
  ];

  // Logic for filtering categories based on selected group
  const availableCategories = useMemo(() => {
    let baseCategoriesData = [...categoriesData];
    
    // Add "other" option to all categories
    baseCategoriesData.push({ value: 'other', group: 'other' });
    
    if (formData.category_group && formData.category_group !== 'other') {
      // Filter categories by selected group + add "other"
      const filtered = baseCategoriesData.filter(cat => cat.group === formData.category_group);
      filtered.push({ value: 'other', group: formData.category_group });
      return filtered;
    }
    // Show all categories if no group selected or "other" group selected
    return baseCategoriesData;
  }, [formData.category_group]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // When category is selected, auto-set the category_group
      if (field === 'category' && value) {
        const selectedCategoryData = categoriesData.find(cat => cat.value === value);
        if (selectedCategoryData) {
          newData.category_group = selectedCategoryData.group;
        }
      }
      
      // When category_group is changed manually, clear category if it doesn't match
      if (field === 'category_group' && value && prev.category) {
        const currentCategoryData = categoriesData.find(cat => cat.value === prev.category);
        if (currentCategoryData && currentCategoryData.group !== value) {
          newData.category = '';
        }
      }
      
      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear general errors
    if (submitStatus === 'error') {
      setSubmitStatus(null);
    }
  };

  // Handle Polish decimal formatting (any format to dot conversion)
  const handleAmountChange = (value) => {
    // Allow any decimal format - will be normalized before submission
    const cleanValue = value.replace(/[^0-9,.-]/g, '');
    handleFieldChange('gross_amount', cleanValue);
  };

  // Normalize amount format (convert any decimal separator to dot)
  const normalizeAmount = (amount) => {
    if (!amount) return '';
    // Replace comma with dot, handle multiple separators
    return amount.replace(',', '.').replace(/\.(?=.*\.)/g, '');
  };

  // Reset functions
  const resetField = (fieldName) => {
    setFormData(prev => ({ 
      ...prev, 
      [fieldName]: '',
      // Also clear custom fields when resetting main fields
      ...(fieldName === 'category_group' ? { custom_category_group: '', category: '', custom_category: '' } : {}),
      ...(fieldName === 'category' ? { custom_category: '' } : {})
    }));
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const resetFormFields = () => {
    setFormData({
      account: '',
      category_group: '',
      category: '',
      gross_amount: '',
      business_timestamp: new Date().toISOString().split('T')[0],
      custom_category_group: '',
      custom_category: '',
    });
    setErrors({});
    
  };

  const resetForm = () => {
    setFormData({
      account: '',
      category_group: '',
      category: '',
      gross_amount: '',
      business_timestamp: new Date().toISOString().split('T')[0],
      custom_category_group: '',
      custom_category: '',
    });
    setErrors({});
    setSubmitStatus(null);
    setLastSubmitted(null);
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.account.trim()) newErrors.account = 'Select account';
    
    // Validate category_group (use custom if "other" selected)
    const finalCategoryGroup = formData.category_group === 'other' ? formData.custom_category_group : formData.category_group;
    if (!finalCategoryGroup.trim()) newErrors.category_group = 'Select or enter category group';
    
    // Validate category (use custom if "other" selected)
    const finalCategory = formData.category === 'other' ? formData.custom_category : formData.category;
    if (!finalCategory.trim()) newErrors.category = 'Select or enter category';
    
    if (!formData.business_timestamp.trim()) newErrors.business_timestamp = 'Select date';
    
    if (!formData.gross_amount.trim()) {
      newErrors.gross_amount = 'Enter amount';
    } else {
      const amount = parseFloat(normalizeAmount(formData.gross_amount));
      if (isNaN(amount) || amount <= 0) {
        newErrors.gross_amount = 'Enter valid amount greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Use custom values if "other" was selected
      const finalCategoryGroup = formData.category_group === 'other' ? formData.custom_category_group : formData.category_group;
      const finalCategory = formData.category === 'other' ? formData.custom_category : formData.category;
      
      const payload = {
        transaction_type: 'expense',
        event_type: 'cost_paid',
        account: formData.account,
        category_group: finalCategoryGroup,
        category: finalCategory,
        gross_amount: normalizeAmount(formData.gross_amount),
        business_timestamp: formData.business_timestamp,
      };

      const response = await fetch('https://erp.jaronski.com/add-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setLastSubmitted({
            account: formData.account,
            category_group: finalCategoryGroup,
            category: finalCategory,
            gross_amount: normalizeAmount(formData.gross_amount),
        });
        setSubmitStatus('success');
        setTimeout(() => {
            resetFormFields();
        }, 5);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Success/Error Messages */}
        {submitStatus === 'success' && lastSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">
              Error adding transaction. Please try again.
            </p>
          </div>
        )}

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
                    className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                    className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                onDoubleClick={(e) => e.target.showPicker && e.target.showPicker()}
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
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;