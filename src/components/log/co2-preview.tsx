'use client';

import { calculateActivityCO2 } from '@/lib/co2-calculator';
import { cn } from '@/lib/utils';

interface Co2PreviewProps {
  category: string;
  subType: string;
  quantity: number;
}

export function Co2Preview({ category, subType, quantity }: Co2PreviewProps) {
  let co2: number | null = null;
  
  if (category && subType && !isNaN(quantity) && quantity > 0) {
    try {
      co2 = calculateActivityCO2(category, subType, quantity);
    } catch (e) {
      co2 = null;
    }
  }

  if (co2 === null) return null;

  let colorClass = 'text-green-600 dark:text-green-400';
  if (co2 > 20) {
    colorClass = 'text-red-600 dark:text-red-400';
  } else if (co2 > 5) {
    colorClass = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border flex items-center justify-between transition-colors">
      <span className="text-sm text-slate-500 font-medium">Estimated Impact</span>
      <span className={cn('text-xl font-bold transition-all', colorClass)}>
        ≈ {co2.toFixed(2)} kg CO₂
      </span>
    </div>
  );
}
