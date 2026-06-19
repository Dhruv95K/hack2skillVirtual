'use client';

import { useEffect, useState } from 'react';
import { StreakCounter } from '@/components/gamification/streak-counter';
import { LevelProgress } from '@/components/gamification/level-progress';
import { BadgeCard } from '@/components/gamification/badge-card';
import { Badge, UserBadge } from '@prisma/client';
import { Loader2 } from 'lucide-react';

interface GamificationData {
  streak: number;
  level: number;
  levelName: string;
  nextLevelName: string | null;
  nextLevelThreshold: number | null;
  currentLevelThreshold: number;
  totalCo2Saved: number;
  badges: {
    all: Badge[];
    earned: (UserBadge & { badge: Badge })[];
  };
}

export default function GamificationPage() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Progress | EcoTrack';
    fetch('/api/gamification')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    );
  }

  const earnedBadgeIds = data.badges.earned.map(b => b.badgeId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <StreakCounter streak={data.streak} />
        </div>
        <div className="md:col-span-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <LevelProgress 
            level={data.level}
            levelName={data.levelName}
            co2Saved={data.totalCo2Saved}
            nextLevelThreshold={data.nextLevelThreshold}
            nextLevelName={data.nextLevelName}
            currentLevelThreshold={data.currentLevelThreshold}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold tracking-tight">Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.badges.all.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const earnedRecord = data.badges.earned.find(b => b.badgeId === badge.id);
            return (
              <BadgeCard 
                key={badge.id}
                badge={badge}
                earned={isEarned}
                earnedAt={earnedRecord?.earnedAt}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
