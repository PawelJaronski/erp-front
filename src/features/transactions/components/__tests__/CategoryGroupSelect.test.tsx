// frontend/src/features/transactions/components/__tests__/CategoryGroupSelect.test.tsx
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CategoryGroupSelect } from '../CategoryGroupSelect';

describe('CategoryGroupSelect', () => {
  it('renders with default placeholder', () => {
    const onChange = jest.fn();
    render(<CategoryGroupSelect value="" onChange={onChange} />);
    
    expect(screen.getByText('All groups')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = jest.fn();
    render(<CategoryGroupSelect value="" onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'opex' } });
    
    expect(onChange).toHaveBeenCalledWith('opex');
  });
});