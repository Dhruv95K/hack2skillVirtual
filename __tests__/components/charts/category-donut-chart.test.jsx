/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryDonutChart } from '@/components/charts/category-donut-chart';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({
    children
  }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({
    children
  }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: props => {
    if (React.isValidElement(props.content)) {
      const Content = props.content.type;
      return <div data-testid="tooltip-container">
          <Content active={true} payload={[{
          payload: {
            color: '#22C55E'
          },
          name: 'Transport',
          value: 10.5
        }]} />
          <Content active={false} payload={[]} />
        </div>;
    }
    return null;
  },
  Legend: () => null
}));
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />
}));
describe('CategoryDonutChart', () => {
  const emptyData = {
    transport: 0,
    food: 0,
    energy: 0
  };
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
    const validData = {
      transport: 10.5,
      food: 5,
      energy: 0
    };
    render(<CategoryDonutChart data={validData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    // Checks that the total label is correctly calculated and rendered
    expect(screen.getByText('15.5')).toBeInTheDocument();
    expect(screen.getByText('kg CO₂')).toBeInTheDocument();
  });
});