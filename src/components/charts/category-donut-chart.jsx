/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
const COLORS = {
  transport: 'var(--nature-green)',
  food: 'var(--ocean-blue)',
  energy: '#0284C7'
};
export function CategoryDonutChart({
  data,
  loading
}) {
  if (loading) {
    return <Skeleton className="w-full h-[300px] rounded-2xl" />;
  }
  const total = data.transport + data.food + data.energy;
  if (total === 0) {
    return <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-surface-2 rounded-2xl bg-surface/50">
        <p className="text-muted-foreground">No data yet — log your first activity!</p>
      </div>;
  }
  const chartData = [{
    name: 'Transport',
    value: data.transport,
    color: COLORS.transport
  }, {
    name: 'Food',
    value: data.food,
    color: COLORS.food
  }, {
    name: 'Energy',
    value: data.energy,
    color: COLORS.energy
  }].filter(d => d.value > 0);
  const CustomTooltip = ({
    active,
    payload
  }) => {
    if (active && payload && payload.length) {
      return <div className="backdrop-blur-xl bg-surface/50 border border-white/5 shadow-lg rounded-xl flex items-center gap-2 p-3">
          <div className="w-3 h-3 rounded-full" style={{
          backgroundColor: payload[0].payload.color
        }} />
          <p className="font-medium text-white">{payload[0].name}:</p>
          <p className="text-white/80">{payload[0].value.toFixed(2)} kg CO₂</p>
        </div>;
    }
    return null;
  };
  return <div className="w-full h-[300px] relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <span className="text-3xl font-heading font-bold text-white">{total.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">kg CO₂</span>
      </div>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} className="z-10">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>;
}