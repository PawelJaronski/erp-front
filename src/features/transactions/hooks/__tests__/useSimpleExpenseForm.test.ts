/// <reference types="jest" />
import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useSimpleExpenseForm } from '../useSimpleExpenseForm';
import type { SimpleExpenseFormData } from '../../types';

const validData: SimpleExpenseFormData = {
  account: 'mbank_osobiste',
  category_group: 'opex',
  category: 'ads',
  gross_amount: '10,00',
  business_timestamp: '2025-01-01',
  include_tax: false,
  tax_rate: 23,
  custom_category_group: '',
  custom_category: '',
};

type HandleFn = (field: keyof import('../../types').SimpleExpenseFormData, value: unknown) => void;
const fillMinimalValidFields = (handle: HandleFn) => {
  handle('account', 'mbank_osobiste');
  handle('gross_amount', '10,00');
  handle('business_timestamp', '2025-01-01');
  handle('category_group', 'opex');
  handle('category', 'ads');
};

describe('useSimpleExpenseForm', () => {
  it('submits valid data without errors', async () => {
    const onSubmit = jest.fn() as any;
    const { result } = renderHook(() => useSimpleExpenseForm({ onSubmit } as any));

    act(() => {
      fillMinimalValidFields(result.current.handleFieldChange as any);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.errors).toEqual({});
  });

  it('sets error when amount missing', async () => {
    const onSubmit = jest.fn() as any;
    const { result } = renderHook(() => useSimpleExpenseForm({ onSubmit } as any));

    act(() => {
      result.current.handleFieldChange('account', 'mbank_osobiste');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.gross_amount).toBe('Enter amount');
  });
}); 