// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { PaymentBrokerTransferForm } from '../PaymentBrokerTransferForm';

jest.mock('@/features/transactions/utils/sales', () => ({
  fetchSalesForDate: jest.fn(),
}));
const { fetchSalesForDate } = jest.requireMock('@/features/transactions/utils/sales') as {
  fetchSalesForDate: jest.Mock;
};

const onSubmit = jest.fn();
const onCancel = jest.fn();

beforeEach(() => {
  fetchSalesForDate.mockReset();
  onSubmit.mockReset();
});

describe('PaymentBrokerTransferForm – happy path', () => {
  it('enables save after successful sales fetch and zero diff', async () => {
    fetchSalesForDate.mockResolvedValue({ paynow: 150, total: 150 });

    render(<PaymentBrokerTransferForm onSubmit={onSubmit} onCancel={onCancel} />);

    // wait until fetch completes
    await waitFor(() => {
      expect(fetchSalesForDate).toHaveBeenCalled();
    });

    const saveButton = screen.getByRole('button', { name: /add/i });
    expect(saveButton).toBeDisabled();

    // enter transfers adding up to 150
    const inputs = screen.getAllByPlaceholderText('123,45');
    await waitFor(() => expect(inputs.length).toBeGreaterThanOrEqual(2));

    fireEvent.change(inputs[0], { target: { value: '100,00' } });
    fireEvent.change(inputs[1], { target: { value: '50,00' } });

    // Wait for diff recalculation; Save should be enabled
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
}); 