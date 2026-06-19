import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { LEVEL_THRESHOLDS } from '@/lib/gamification';
import { computeLevel } from '@/lib/gamification-engine';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { userBadges: { include: { badge: true } } }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allBadges = await prisma.badge.findMany();
    
    const { level, name: levelName } = computeLevel(dbUser.totalCo2Tracked);
    
    const sortedThresholds = [...LEVEL_THRESHOLDS].sort((a, b) => a.minCO2Tracked - b.minCO2Tracked);
    const currentIndex = sortedThresholds.findIndex(t => t.level === level);
    
    const currentThreshold = sortedThresholds[currentIndex]?.minCO2Tracked || 0;
    const nextLevelThresholdObj = sortedThresholds[currentIndex + 1];
    
    const responseData = {
      streak: dbUser.streak,
      level,
      levelName,
      nextLevelName: nextLevelThresholdObj?.name || null,
      nextLevelThreshold: nextLevelThresholdObj?.minCO2Tracked || null,
      currentLevelThreshold: currentThreshold,
      totalCo2Saved: dbUser.totalCo2Tracked,
      badges: {
        all: allBadges,
        earned: dbUser.userBadges
      }
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}
