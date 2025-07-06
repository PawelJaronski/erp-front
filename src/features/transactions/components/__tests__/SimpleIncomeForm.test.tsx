// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SimpleIncomeForm } from '../SimpleIncomeForm';

function setup() {
  const onSubmit = jest.fn() as any;
  render(<SimpleIncomeForm onSubmit={onSubmit} onCancel={() => {}} />);
  return { onSubmit };
}

describe('SimpleIncomeForm component', () => {
  it('shows validation error when required fields are empty', async () => {
    setup();
    const saveButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(saveButton);

    expect(screen.queryByText(/enter amount/i)).not.toBeNull();
    expect(screen.queryByText(/select date/i)).not.toBeNull();
  });
}); 