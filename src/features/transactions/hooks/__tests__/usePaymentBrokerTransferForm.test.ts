/// <reference types="jest" />
import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { usePaymentBrokerTransferForm } from '../usePaymentBrokerTransferForm';
import type { PaymentBrokerTransferFormData } from '../../types';

const fillRequired = (
  handle: <K extends keyof PaymentBrokerTransferFormData>(f: K, v: PaymentBrokerTransferFormData[K]) => void,
) => {
  handle('paynow_transfer', '100,00');
  handle('transfer_date', '2025-01-02');
  handle('sales_date', '2025-01-01');
};

describe('usePaymentBrokerTransferForm', () => {
  it('submits when valid', async () => {
    const onSubmit = jest.fn() as (d: PaymentBrokerTransferFormData) => Promise<void>;
    const { result } = renderHook(() => usePaymentBrokerTransferForm({ onSubmit }));

    act(() => {
      fillRequired(result.current.handleFieldChange);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.errors).toEqual({});
  });
}); 