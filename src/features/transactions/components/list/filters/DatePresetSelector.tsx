'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ComboBox } from '@/shared/components/form/ComboBox';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, startOfMonth, startOfYear, endOfMonth as endOfMonthFn, subMonths } from 'date-fns';
import { RangeKeyDict, Range } from 'react-date-range';

const DATE_PRESET_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'month_to_date', label: 'Month to Date' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'year_to_date', label: 'Year to Date' },
] as const;

function getPresetRange(preset: string | undefined) {
    const today = new Date();
    switch (preset) {
        case 'today':
            return { from: today, to: today };
        case 'yesterday': {
            const y = addDays(today, -1);
            return { from: y, to: y };
        }
        case 'month_to_date':
            return { from: startOfMonth(today), to: today };
        case 'last_month': {
            const first = startOfMonth(subMonths(today, 1));
            const last = endOfMonthFn(subMonths(today, 1));
            return { from: first, to: last };
        }
        case 'year_to_date':
            return { from: startOfYear(today), to: today };
        default:
            return { from: undefined, to: undefined };
    }
}

// Funkcja do formatowania daty na YYYY-MM-DD niezależnie od strefy czasowej
function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface DatePresetSelectorProps {
    value?: string;
    onPresetChange?: (preset: string | undefined) => void;
    dateFrom?: string;
    dateTo?: string;
    onDateRangeChange?: (from: string, to: string) => void;
    pendingDateRange?: boolean;
    setPendingDateRange?: (val: boolean) => void;
}

export function DatePresetSelector({ value, onPresetChange, dateFrom, dateTo, onDateRangeChange, pendingDateRange, setPendingDateRange }: DatePresetSelectorProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [range, setRange] = useState<Range>({
        startDate: dateFrom ? new Date(dateFrom) : undefined,
        endDate: dateTo ? new Date(dateTo) : undefined,
        key: 'selection',
    });
    const [tempRange, setTempRange] = useState<Range>({
        startDate: dateFrom ? new Date(dateFrom) : undefined,
        endDate: dateTo ? new Date(dateTo) : undefined,
        key: 'selection',
    });
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRange({
            startDate: dateFrom ? new Date(dateFrom) : undefined,
            endDate: dateTo ? new Date(dateTo) : undefined,
            key: 'selection',
        });
        setTempRange({
            startDate: dateFrom ? new Date(dateFrom) : undefined,
            endDate: dateTo ? new Date(dateTo) : undefined,
            key: 'selection',
        });
    }, [dateFrom, dateTo]);

    // Obsługa click outside i Escape
    useEffect(() => {
        if (!showPicker) return;
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
                if (pendingDateRange) setPendingDateRange?.(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setShowPicker(false);
                if (pendingDateRange) setPendingDateRange?.(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showPicker, pendingDateRange, setPendingDateRange]);

    const handlePresetChange = (selected: string | undefined) => {
        if (selected === undefined) {
            setPendingDateRange?.(true);
            return;
        }
        onPresetChange?.(selected || undefined);
        if (selected) {
            const { from, to } = getPresetRange(selected);
            setRange({ startDate: from, endDate: to, key: 'selection' });
            setTempRange({ startDate: from, endDate: to, key: 'selection' });
        } else {
            setRange({ startDate: undefined, endDate: undefined, key: 'selection' });
            setTempRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        }
    };

    const handleRangeChange = (ranges: RangeKeyDict) => {
        const sel = ranges.selection;
        setTempRange(sel);
    };

    const handleApplyRange = () => {
        if (tempRange.startDate && tempRange.endDate) {
            setRange(tempRange);
            onDateRangeChange?.(
                formatDateLocal(tempRange.startDate),
                formatDateLocal(tempRange.endDate)
            );
            setShowPicker(false);
            setPendingDateRange?.(false);
        }
    };

    const handleCancelRange = () => {
        setShowPicker(false);
        setPendingDateRange?.(false);
    };

    const displayValue = range.startDate && range.endDate
        ? `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
        : '';

    // Otwieraj picker jeśli pendingDateRange true
    useEffect(() => {
        if (pendingDateRange) {
            setShowPicker(true);
        }
    }, [pendingDateRange]);

    // Funkcja obsługująca kliknięcie krzyżyka (clear) w input
    const handleClearRangeInput = () => {
        setTempRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        onPresetChange?.('month_to_date');
        setShowPicker(false);
        setPendingDateRange?.(false);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
            <ComboBox
                value={value || ''}
                onChange={handlePresetChange}
                options={DATE_PRESET_OPTIONS}
                placeholder="Select date preset"
                isClearable={true}
            />
            {/* Pokazuj zakres tylko, gdy NIE wybrano presetu */}
            {!value && !pendingDateRange && (
                <>
                    {displayValue && (
                        <div className="text-xs text-gray-500 mt-1">{displayValue}</div>
                    )}
                    <div className="mt-2 relative flex items-center">
                        <input
                            type="text"
                            readOnly
                            value={displayValue}
                            placeholder="Select date range"
                            className="w-full px-4 py-2 border rounded cursor-pointer pr-8"
                            onClick={() => setShowPicker(!showPicker)}
                        />
                        {/* Krzyżyk do zerowania zakresu dat w input */}
                        {range.startDate && range.endDate && (
                            <button
                                type="button"
                                aria-label="Wyczyść zakres dat"
                                className="absolute right-2 text-gray-400 hover:text-gray-700 text-xl z-10"
                                style={{ top: '50%', transform: 'translateY(-50%)' }}
                                onClick={handleClearRangeInput}
                            >
                                ×
                            </button>
                        )}
                        {showPicker && (
                            <div ref={pickerRef} className="absolute z-50 bg-white shadow-lg mt-2 left-0">
                                <DateRange
                                    ranges={[tempRange]}
                                    onChange={handleRangeChange}
                                    moveRangeOnFirstSelection={false}
                                    editableDateInputs={true}
                                    maxDate={new Date('2100-12-31')}
                                />
                                <div className="flex gap-2 border-t bg-gray-50 p-2">
                                    <button
                                        className="flex-1 py-1 text-sm text-blue-600 hover:underline"
                                        onClick={handleApplyRange}
                                        disabled={!(tempRange.startDate && tempRange.endDate)}
                                    >
                                        Zastosuj
                                    </button>
                                    <button
                                        className="flex-1 py-1 text-sm text-gray-600 hover:underline"
                                        onClick={handleCancelRange}
                                    >
                                        Anuluj
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
            {/* Jeśli user kliknął clear, pokaż tylko picker bez resetowania listy */}
            {pendingDateRange && showPicker && (
                <div className="mt-2 relative">
                    <div ref={pickerRef} className="absolute z-50 bg-white shadow-lg mt-2">
                        <DateRange
                            ranges={[tempRange]}
                            onChange={handleRangeChange}
                            moveRangeOnFirstSelection={false}
                            editableDateInputs={true}
                            maxDate={new Date('2100-12-31')}
                        />
                        <div className="flex gap-2 border-t bg-gray-50 p-2">
                            <button
                                className="flex-1 py-1 text-sm text-blue-600 hover:underline"
                                onClick={handleApplyRange}
                                disabled={!(tempRange.startDate && tempRange.endDate)}
                            >
                                Zastosuj
                            </button>
                            <button
                                className="flex-1 py-1 text-sm text-gray-600 hover:underline"
                                onClick={handleCancelRange}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}