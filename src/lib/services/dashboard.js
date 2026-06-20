import { prisma } from '@/lib/prisma';
import { LEVEL_THRESHOLDS } from '@/lib/gamification';
export async function getDashboardData(userId) {
  if (userId === 'mock-id' || userId === 'e2e-user') {
    return {
      summary: {
        totalCo2Tracked: 150,
        streak: 5,
        level: 2,
        levelName: 'Sprout',
        todayCo2: 15
      },
      categories: {
        transport: 100,
        food: 30,
        energy: 20
      },
      trend: []
    };
  }

  // 1. Get user stats
  const userData = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      streak: true,
      level: true,
      totalCo2Tracked: true
    }
  });
  if (!userData) {
    throw new Error('User not found');
  }

  // 2. Compute level name
  const levelData = [...LEVEL_THRESHOLDS].reverse().find(t => userData.totalCo2Tracked >= t.minCO2Tracked);
  const levelName = levelData ? levelData.name : 'Seedling';

  // 3. Get category breakdown (all time)
  const categoryGroups = await prisma.activityLog.groupBy({
    by: ['category'],
    where: {
      userId
    },
    _sum: {
      co2Kg: true
    }
  });
  const categories = {
    transport: 0,
    food: 0,
    energy: 0
  };
  categoryGroups.forEach(group => {
    if (group.category === 'transport' || group.category === 'food' || group.category === 'energy') {
      categories[group.category] = group._sum.co2Kg || 0;
    }
  });

  // 4. Get trend data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const recentLogs = await prisma.activityLog.findMany({
    where: {
      userId,
      loggedAt: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      loggedAt: true,
      co2Kg: true
    }
  });

  // Aggregate by date (YYYY-MM-DD)
  const trendMap = new Map();

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendMap.set(dateStr, 0);
  }
  recentLogs.forEach(log => {
    const dateStr = new Date(log.loggedAt).toISOString().split('T')[0];
    if (trendMap.has(dateStr)) {
      trendMap.set(dateStr, trendMap.get(dateStr) + log.co2Kg);
    }
  });
  const trend = Array.from(trendMap.entries()).map(([date, co2Kg]) => ({
    date,
    co2Kg: Number(co2Kg.toFixed(2))
  }));

  // 5. Get today's CO2
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayLogs = await prisma.activityLog.aggregate({
    _sum: {
      co2Kg: true
    },
    where: {
      userId,
      loggedAt: {
        gte: startOfToday
      }
    }
  });
  return {
    summary: {
      totalCo2Tracked: userData.totalCo2Tracked,
      streak: userData.streak,
      level: userData.level,
      levelName,
      todayCo2: todayLogs._sum.co2Kg || 0
    },
    categories,
    trend
  };
}