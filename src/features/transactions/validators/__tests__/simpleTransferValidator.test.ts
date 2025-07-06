/// <reference types="jest" />
import { describe, it, expect } from '@jest/globals';
import { simpleTransferValidator } from '../simpleTransferValidator';
import type { SimpleTransferFormData } from '../../types';

const base: SimpleTransferFormData = {
  account: 'mbank_firmowe',
  to_account: 'mbank_osobiste',
  gross_amount: '100,00',
  business_timestamp: '2025-01-01',
};

describe('simpleTransferValidator', () => {
  it('returns empty object when data is valid', () => {
    const errors = simpleTransferValidator({ ...base });
    expect(errors).toEqual({});
  });

  it('flags identical accounts', () => {
    const errors = simpleTransferValidator({ ...base, to_account: 'mbank_firmowe' });
    expect(errors.to_account).toBe('From and To accounts must differ');
  });

  it('flags missing amount', () => {
    const errors = simpleTransferValidator({ ...base, gross_amount: '' });
    expect(errors.gross_amount).toBe('Enter amount');
  });
}); 