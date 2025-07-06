/// <reference types="jest" />
import { describe, it, expect } from '@jest/globals';
import { paymentBrokerTransferValidator } from '../paymentBrokerTransferValidator';
import type { PaymentBrokerTransferFormData } from '../../types';

const base: PaymentBrokerTransferFormData = {
  sales_date: '2025-01-01',
  transfer_date: '2025-01-02',
  paynow_transfer: '100,00',
  autopay_transfer: '',
  business_timestamp: '2025-01-02',
};

describe('paymentBrokerTransferValidator', () => {
  it('passes valid data', () => {
    const errors = paymentBrokerTransferValidator({ ...base });
    expect(errors).toEqual({});
  });

  it('requires at least one amount', () => {
    const errors = paymentBrokerTransferValidator({ ...base, paynow_transfer: '', autopay_transfer: '' });
    expect(errors.paynow_transfer).toBe('Enter at least one amount');
  });

  it('validates date gap', () => {
    const errors = paymentBrokerTransferValidator({ ...base, transfer_date: '2025-01-01' });
    expect(errors.transfer_date).toBe('transfer_date must be at least 1 day after sales_date');
  });
}); 