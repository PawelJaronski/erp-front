import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  currency?: string;
}

export function AmountInput({
  value,
  onChange,
  error,
  placeholder = '123.45 or 123,45',
  currency = 'zł'
}: AmountInputProps) {
  const handleAmountChange = (inputValue: string) => {
    const clean = inputValue.replace(/[^0-9,.-]/g, '');
    onChange(clean);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      {currency && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {currency}
        </span>
      )}
    </div>
  );
} 