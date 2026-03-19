import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIInsightCard } from '../components/AIInsightCard';
import type { AIInsight } from '../types/weather';

const mockInsight: AIInsight = {
  summary: 'Clear skies and warm in London today.',
  highlights: ['Low humidity.', 'Calm winds.', 'No rain expected.'],
  recommendation: 'Great day for outdoor activities!',
};

describe('AIInsightCard', () => {
  it('renders the summary text', () => {
    render(<AIInsightCard insight={mockInsight} />);
    expect(screen.getByText(mockInsight.summary)).toBeInTheDocument();
  });

  it('renders all three highlights', () => {
    render(<AIInsightCard insight={mockInsight} />);
    mockInsight.highlights.forEach((h) => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });
  });

  it('renders the recommendation', () => {
    render(<AIInsightCard insight={mockInsight} />);
    expect(screen.getByText(mockInsight.recommendation)).toBeInTheDocument();
  });

  it('shows the AI badge text', () => {
    render(<AIInsightCard insight={mockInsight} />);
    expect(screen.getByText('Powered by GPT-4o-mini')).toBeInTheDocument();
  });
});
