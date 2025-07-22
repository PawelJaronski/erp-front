"use client";
import React, { useRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, placeholder = '', clearable = true, className }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Native date picker opening (Chromium-only at the moment)
  const openPicker = () => {
    const node = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    node?.showPicker?.();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDoubleClick={openPicker}
        placeholder={placeholder}
        className="w-full pr-20 px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
      />
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          tabIndex={0}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-1 cursor-pointer rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          title="Clear date"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
      <button
        type="button"
        onClick={openPicker}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer rounded-md text-gray-500 hover:text-gray-700"
      >
        <CalendarIcon className="w-4 h-4 cursor-pointer" />
      </button>
    </div>
  );
} 