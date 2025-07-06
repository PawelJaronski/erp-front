// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PaymentBrokerTransferForm } from '../PaymentBrokerTransferForm';

jest.mock('@/forms/simple-transaction-form/utils/sales', () => ({
  fetchSalesForDate: jest.fn(),
}));
const { fetchSalesForDate } = jest.requireMock('@/forms/simple-transaction-form/utils/sales') as {
  fetchSalesForDate: jest.Mock;
};

const onSubmit = jest.fn() as any;
const onCancel = jest.fn();

const renderForm = () =>
  render(<PaymentBrokerTransferForm onSubmit={onSubmit} onCancel={onCancel} />);

beforeEach(() => {
  fetchSalesForDate.mockReset();
  onSubmit.mockReset();
});

describe('PaymentBrokerTransferForm – error handling', () => {
  it('shows error banner and disables save when fetch fails', async () => {
    fetchSalesForDate.mockRejectedValue(new Error('Network error'));

    renderForm();

    // Wait for fetch to be called and error displayed
    await waitFor(() => {
      expect(fetchSalesForDate).toHaveBeenCalled();
    });

    expect(await screen.findByText('Network error')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /add/i });
    expect(saveButton).toBeDisabled();
  });

  it('retry button triggers fetch again', async () => {
    fetchSalesForDate.mockRejectedValueOnce(new Error('Network error'));
    fetchSalesForDate.mockResolvedValueOnce({ paynow: 100, total: 100 });

    renderForm();

    // wait for error banner
    await screen.findByText('Network error');

    const retry = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retry);

    await waitFor(() => {
      expect(fetchSalesForDate).toHaveBeenCalledTimes(2);
    });

    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
  });
}); 