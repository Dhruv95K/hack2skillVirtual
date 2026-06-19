/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryDonutChart } from '@/components/charts/category-donut-chart';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />
}));

describe('CategoryDonutChart', () => {
  const emptyData = { transport: 0, food: 0, energy: 0 };
  
  it('renders a loading skeleton when loading is true', () => {
    render(<CategoryDonutChart data={emptyData} loading={true} />);
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders an empty state when total data is zero', () => {
    render(<CategoryDonutChart data={emptyData} />);
    
    expect(screen.getByText('No data yet — log your first activity!')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders the PieChart and total label when data is present', () => {
    const validData = { transport: 10.5, food: 5, energy: 0 };
    render(<CategoryDonutChart data={validData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    
    // Checks that the total label is correctly calculated and rendered
    expect(screen.getByText('15.5')).toBeInTheDocument();
    expect(screen.getByText('kg CO₂')).toBeInTheDocument();
  });
});
