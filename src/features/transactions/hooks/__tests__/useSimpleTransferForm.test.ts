/// <reference types="jest" />
import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useSimpleTransferForm } from '../useSimpleTransferForm';
import type { SimpleTransferFormData } from '../../types';

const fillRequiredFields = (
  handle: <K extends keyof SimpleTransferFormData>(f: K, v: SimpleTransferFormData[K]) => void,
) => {
  handle('account', 'mbank_firmowe');
  handle('to_account', 'mbank_osobiste');
  handle('gross_amount', '50,00');
  handle('business_timestamp', '2025-01-01');
};

describe('useSimpleTransferForm', () => {
  it('calls onSubmit when form is valid', async () => {
    const onSubmit = jest.fn() as (data: SimpleTransferFormData) => Promise<void>;
    const { result } = renderHook(() => useSimpleTransferForm({ onSubmit }));

    act(() => {
      fillRequiredFields(result.current.handleFieldChange);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.errors).toEqual({});
  });
}); 