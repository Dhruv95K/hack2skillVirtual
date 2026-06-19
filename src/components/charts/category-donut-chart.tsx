'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryData {
  transport: number;
  food: number;
  energy: number;
}

interface CategoryDonutChartProps {
  data: CategoryData;
  loading?: boolean;
}

const COLORS = {
  transport: '#22C55E',
  food: '#16A34A',
  energy: '#4ADE80'
};

export function CategoryDonutChart({ data, loading }: CategoryDonutChartProps) {
  if (loading) {
    return <Skeleton className="w-full h-[300px] rounded-2xl" />;
  }

  const total = data.transport + data.food + data.energy;

  if (total === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-surface-2 rounded-2xl bg-surface/50">
        <p className="text-muted-foreground">No data yet — log your first activity!</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Transport', value: data.transport, color: COLORS.transport },
    { name: 'Food', value: data.food, color: COLORS.food },
    { name: 'Energy', value: data.energy, color: COLORS.energy }
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-2 p-3 rounded-xl border border-surface shadow-lg flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <p className="font-medium text-white">{payload[0].name}:</p>
          <p className="text-white/80">{payload[0].value.toFixed(2)} kg CO₂</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 mt-[-20px]">
        <span className="text-3xl font-heading font-bold text-white">{total.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">kg CO₂</span>
      </div>
      <ResponsiveContainer width="100%" height="100%" className="z-10">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
