/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Co2TrendChart } from '@/components/charts/co2-trend-chart';

// Mock recharts to avoid JSDOM issues with ResizeObserver and SVG rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: (props: any) => {
    if (props.tickFormatter) props.tickFormatter(100);
    return null;
  },
  Tooltip: (props: any) => {
    if (React.isValidElement(props.content)) {
      const Content = props.content.type as React.FC<any>;
      return (
        <div data-testid="tooltip-container">
          <Content active={true} payload={[{ payload: { displayDate: 'Jun 18' }, value: 5.2 }]} />
          <Content active={false} payload={[]} />
        </div>
      );
    }
    return null;
  },
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />
}));

describe('Co2TrendChart', () => {
  it('renders a loading skeleton when loading is true', () => {
    render(<Co2TrendChart data={[]} loading={true} />);
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders an empty state when data array is empty or has zero values', () => {
    render(<Co2TrendChart data={[{ date: '2026-06-18', co2Kg: 0 }]} />);
    
    expect(screen.getByText('No data yet — log your first activity!')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders the AreaChart when valid data is present', () => {
    const mockData = [
      { date: '2026-06-18', co2Kg: 5.2 },
      { date: '2026-06-19', co2Kg: 3.1 }
    ];
    render(<Co2TrendChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });
});
