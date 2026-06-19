/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Footprints, Flame, Train, Salad, Zap, Trophy, LucideIcon } from 'lucide-react';

interface BadgeCardProps {
  badge: { key: string; name: string; description: string; icon: string; };
  earned: boolean;
  earnedAt?: Date;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Train,
  Salad,
  Zap,
  Trophy,
};

export function BadgeCard({ badge, earned, earnedAt }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] || Trophy;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={earned && !shouldReduceMotion ? { scale: 0.9, opacity: 0 } : false}
      animate={earned && !shouldReduceMotion ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card className={`relative overflow-hidden h-full ${earned ? 'border-green-500 bg-green-50/10' : 'grayscale opacity-60 border-muted'}`}>
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className={`p-4 rounded-full ${earned ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
            <Icon size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
          </div>
          
          <div className="mt-auto pt-4 text-xs font-medium">
            {earned ? (
              <span className="text-green-600">
                Earned {earnedAt ? new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 justify-center text-muted-foreground">
                <Lock size={12} /> Keep going!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

