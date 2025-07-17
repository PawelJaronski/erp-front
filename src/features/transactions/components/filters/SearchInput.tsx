'use client'

import React from 'react'

interface SearchInputProps {
    value: string | undefined
    onChange: (value: string | undefined) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search:</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="Search transactions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
          style={{ minHeight: '48px' }}
        />
      </div>
    );
  }