import React from 'react';
import Select from 'react-select';

interface Option {
  readonly value: string;
  readonly label: string;
}

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  error?: string;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  className?: string;
}

export function ComboBox({
  value,
  onChange,
  options,
  error,
  placeholder = 'Select...',
  isClearable = true,
  isSearchable = true,
  className = ''
}: ComboBoxProps) {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className={className}>
      <Select
        value={selectedOption}
        onChange={(option) => onChange(option?.value || '')}
        options={options}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '48px',
            borderColor: error ? '#fca5a5' : state.isFocused ? '#3b82f6' : '#d1d5db',
            backgroundColor: error ? '#fef2f2' : base.backgroundColor,
            borderRadius: '8px',
            '&:hover': {
              borderColor: error ? '#fca5a5' : '#3b82f6'
            }
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : base.backgroundColor,
            color: state.isSelected ? '#ffffff' : base.color,
            padding: '12px 16px',
            cursor: 'pointer'
          }),
          menu: (base) => ({
            ...base,
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }),
          placeholder: (base) => ({
            ...base,
            color: '#9ca3af'
          }),
          singleValue: (base) => ({
            ...base,
            color: '#1f2937'
          })
        }}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 