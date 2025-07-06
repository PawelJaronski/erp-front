/// <reference types="jest" />
import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useSimpleExpenseForm } from '../useSimpleExpenseForm';
import type { SimpleExpenseFormData } from '../../types';

const submitMock = jest.fn<Promise<void>, [SimpleExpenseFormData]>();

const fillRequiredFields = (handle: <K extends keyof SimpleExpenseFormData>(f: K, v: SimpleExpenseFormData[K]) => void) => {
  handle('account', 'mbank_osobiste');
  handle('gross_amount', '10,00');
  handle('business_timestamp', '2025-01-01');
  handle('category_group', 'opex');
  handle('category', 'ads');
};

describe('useSimpleExpenseForm', () => {
  it('submits valid data without errors', async () => {
    const { result } = renderHook(() => useSimpleExpenseForm({ onSubmit: submitMock }));

    act(() => {
      fillRequiredFields(result.current.handleFieldChange);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(result.current.errors).toEqual({});
  });

  it('sets error when amount missing', async () => {
    submitMock.mockClear();
    const { result } = renderHook(() => useSimpleExpenseForm({ onSubmit: submitMock }));

    act(() => {
      // Fill only a subset – leave amount empty
      result.current.handleFieldChange('account', 'mbank_osobiste');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(submitMock).not.toHaveBeenCalled();
    expect(result.current.errors.gross_amount).toBe('Enter amount');
  });
}); 