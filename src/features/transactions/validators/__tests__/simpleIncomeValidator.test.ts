/// <reference types="jest" />
import { describe, it, expect } from '@jest/globals';
import { simpleIncomeValidator } from '../simpleIncomeValidator';
import type { SimpleIncomeFormData } from '../../types';

// Minimal valid payload helper
const validBase: SimpleIncomeFormData = {
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

describe('simpleIncomeValidator', () => {
  it('returns empty object when data is valid', () => {
    const errors = simpleIncomeValidator({ ...validBase });
    expect(errors).toEqual({});
  });

  it('flags missing account', () => {
    const errors = simpleIncomeValidator({ ...validBase, account: '' });
    expect(errors.account).toBe('Select account');
  });

  it('flags missing amount', () => {
    const errors = simpleIncomeValidator({ ...validBase, gross_amount: '' });
    expect(errors.gross_amount).toBe('Enter amount');
  });

  it('flags missing business date', () => {
    const errors = simpleIncomeValidator({ ...validBase, business_timestamp: '' });
    expect(errors.business_timestamp).toBe('Select date');
  });
}); 