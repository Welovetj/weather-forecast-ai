import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  const mockSearch = vi.fn();

  beforeEach(() => {
    mockSearch.mockClear();
  });

  it('renders input, select and button', () => {
    render(<SearchBar onSearch={mockSearch} loading={false} />);
    expect(screen.getByTestId('city-input')).toBeInTheDocument();
    expect(screen.getByTestId('units-select')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('calls onSearch with trimmed city and selected units on submit', () => {
    render(<SearchBar onSearch={mockSearch} loading={false} />);
    const input = screen.getByTestId('city-input');
    fireEvent.change(input, { target: { value: '  London  ' } });
    fireEvent.submit(input.closest('form')!);
    expect(mockSearch).toHaveBeenCalledWith('London', 'metric');
  });

  it('does not submit when city is empty', () => {
    render(<SearchBar onSearch={mockSearch} loading={false} />);
    fireEvent.submit(screen.getByTestId('city-input').closest('form')!);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('disables inputs while loading', () => {
    render(<SearchBar onSearch={mockSearch} loading={true} />);
    expect(screen.getByTestId('city-input')).toBeDisabled();
    expect(screen.getByTestId('search-button')).toBeDisabled();
  });

  it('shows loading text while loading', () => {
    render(<SearchBar onSearch={mockSearch} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
