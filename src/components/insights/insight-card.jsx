'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Car, Utensils, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const CATEGORY_META = {
  transport: {
    icon: Car,
    label: 'Transport',
    iconClassName: 'text-sky-300',
    accentClassName: 'bg-sky-400/10 text-sky-200 border-sky-400/20'
  },
  food: {
    icon: Utensils,
    label: 'Food',
    iconClassName: 'text-lime-300',
    accentClassName: 'bg-lime-400/10 text-lime-200 border-lime-400/20'
  },
  energy: {
    icon: Zap,
    label: 'Energy',
    iconClassName: 'text-amber-300',
    accentClassName: 'bg-amber-400/10 text-amber-100 border-amber-400/20'
  }
};
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
function formatSaving(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1
  }).format(value);
}
export function InsightCard({
  title,
  description,
  estimatedSavingKg,
  category
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const shouldReduceMotion = useReducedMotion();
  return <motion.article variants={shouldReduceMotion ? undefined : cardVariants}>
      <Card className="h-full border-l-4 border-accent bg-surface/95 text-white ring-white/8">
        <CardHeader className="gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/10">
                <Icon className={`size-5 ${meta.iconClassName}`} />
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className={`border px-2 py-1 text-[11px] font-semibold tracking-wide uppercase ${meta.accentClassName}`}>
                  {meta.label}
                </Badge>
                <CardTitle className="text-lg text-white">{title}</CardTitle>
              </div>
            </div>

            <Badge className="border border-emerald-400/20 bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-200">
              Est. saving: {formatSaving(estimatedSavingKg)} kg CO2
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </CardContent>
      </Card>
    </motion.article>;
}