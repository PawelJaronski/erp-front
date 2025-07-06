// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePaymentBrokerTransferForm } from '../usePaymentBrokerTransferForm';
import type { PaymentBrokerTransferFormData } from '../../types';

// mock sales fetch utility
jest.mock('@/forms/simple-transaction-form/utils/sales', () => ({
  fetchSalesForDate: jest.fn(),
}));

const { fetchSalesForDate } = jest.requireMock('@/forms/simple-transaction-form/utils/sales') as {
  fetchSalesForDate: jest.Mock;
};

const fillBase = (
  handle: <K extends keyof PaymentBrokerTransferFormData>(f: K, v: PaymentBrokerTransferFormData[K]) => void,
) => {
  handle('paynow_transfer', '100,00');
  handle('transfer_date', '2025-01-02');
};

beforeEach(() => {
  fetchSalesForDate.mockReset();
});

describe('usePaymentBrokerTransferForm – sales cache', () => {
  it('caches sales results per date', async () => {
    // @ts-ignore
    fetchSalesForDate.mockResolvedValue({ paynow: 200, total: 200 } as any);

    const onSubmit = jest.fn() as (d: PaymentBrokerTransferFormData) => Promise<void>;
    const { result } = renderHook(() => usePaymentBrokerTransferForm({ onSubmit }));

    // initial effect triggers once
    await waitFor(() => {
      expect(fetchSalesForDate).toHaveBeenCalledTimes(1);
    });

    act(() => {
      fillBase(result.current.handleFieldChange);
      result.current.handleFieldChange('sales_date', '2025-07-05');
    });

    await waitFor(() => {
      expect(fetchSalesForDate).toHaveBeenCalledTimes(2);
    });

    // set same date again – should use cache
    act(() => {
      result.current.handleFieldChange('sales_date', '2025-07-05');
    });

    // little timeout to allow potential fetch
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchSalesForDate).toHaveBeenCalledTimes(2);
  });
}); 