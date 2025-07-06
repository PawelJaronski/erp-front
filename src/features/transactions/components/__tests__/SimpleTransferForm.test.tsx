/// <reference types="jest" />
import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SimpleTransferForm } from '../SimpleTransferForm';

function setup() {
  const onSubmit = jest.fn() as unknown as (data: import('../../types').SimpleTransferFormData) => Promise<void>;
  render(<SimpleTransferForm onSubmit={onSubmit} onCancel={() => {}} />);
  return { onSubmit };
}

describe('SimpleTransferForm component', () => {
  it('shows validation error when amount is missing', async () => {
    setup();
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(screen.queryByText(/enter amount/i)).not.toBeNull();
  });
}); 