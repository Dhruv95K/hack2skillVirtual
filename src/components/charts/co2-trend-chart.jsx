/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
export function Co2TrendChart({
  data,
  loading
}) {
  if (loading) {
    return <Skeleton className="w-full h-[300px] rounded-2xl" />;
  }
  const hasData = data.some(d => d.co2Kg > 0);
  if (!hasData) {
    return <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-surface-2 rounded-2xl bg-surface/50">
        <p className="text-muted-foreground">No data yet — log your first activity!</p>
      </div>;
  }

  // Format dates for X-axis
  const formattedData = data.map(d => {
    const dateObj = new Date(d.date);
    return {
      ...d,
      displayDate: dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    };
  });
  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {
    if (active && payload && payload.length) {
      return <div className="p-3 rounded-xl backdrop-blur-xl bg-surface/50 border border-white/5 shadow-lg">
          <p className="font-medium text-white">{payload[0].payload.displayDate}</p>
          <p className="text-[color:var(--nature-green)]">{payload[0].value} kg CO₂</p>
        </div>;
    }
    return null;
  };
  return <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={formattedData} margin={{
        top: 10,
        right: 10,
        left: -20,
        bottom: 0
      }}>
          <defs>
            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--nature-green)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--nature-green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `${value}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="co2Kg" stroke="var(--nature-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>;
}