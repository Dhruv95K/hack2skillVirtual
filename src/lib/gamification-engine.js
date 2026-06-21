import { LEVEL_THRESHOLDS, BADGE_DEFINITIONS } from './gamification';
import { prisma } from './prisma';
export function computeLevel(co2Saved) {
  const thresholds = [...LEVEL_THRESHOLDS].sort((a, b) => b.minCO2Tracked - a.minCO2Tracked);
  const found = thresholds.find(t => co2Saved >= t.minCO2Tracked);
  return found ? {
    level: found.level,
    name: found.name
  } : {
    level: 1,
    name: 'Seedling'
  };
}
export function shouldAwardBadge(badgeKey, ctx) {
  const def = BADGE_DEFINITIONS.find(b => b.key === badgeKey);
  if (!def) return false;
  switch (def.thresholdType) {
    case 'total_logs':
      return ctx.totalLogs >= def.thresholdValue;
    case 'streak':
      return ctx.streak >= def.thresholdValue;
    case 'transport_logs':
      return ctx.transportLogs >= def.thresholdValue;
    case 'plant_logs':
      return ctx.plantLogs >= def.thresholdValue;
    case 'energy_logs':
      return ctx.energyLogs >= def.thresholdValue;
    case 'co2_saved':
    case 'co2_tracked':
      return ctx.co2Saved >= def.thresholdValue;
    default:
      return false;
  }
}
export async function updateStreak(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const lastLogged = user.lastLoggedAt ? new Date(user.lastLoggedAt) : null;
  if (lastLogged) {
    lastLogged.setUTCHours(0, 0, 0, 0);
  }
  const daysDiff = lastLogged ? Math.floor((today.getTime() - lastLogged.getTime()) / 86400000) : null;
  let newStreak = user.streak;
  if (daysDiff === 0) return user;
  if (daysDiff === null || daysDiff > 1) newStreak = 1; // first log or gap > 1 day
  else if (daysDiff === 1) newStreak = user.streak + 1; // consecutive day
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      streak: newStreak,
      lastLoggedAt: new Date()
    }
  });
}
export async function checkAndAwardBadges(userId, userRecord) {
  const user = userRecord || (await prisma.user.findUnique({
    where: {
      id: userId
    }
  }));
  if (!user) return;
  const totalLogs = await prisma.activityLog.count({
    where: {
      userId
    }
  });
  const transportLogs = await prisma.activityLog.count({
    where: {
      userId,
      category: 'transport'
    }
  });
  const energyLogs = await prisma.activityLog.count({
    where: {
      userId,
      category: 'energy'
    }
  });
  const plantLogs = await prisma.activityLog.count({
    where: {
      userId,
      category: 'food',
      subType: 'plant_based_meal'
    }
  });
  const ctx = {
    totalLogs,
    streak: user.streak,
    transportLogs,
    plantLogs,
    energyLogs,
    co2Saved: user.totalCo2Tracked
  };
  const allBadges = await prisma.badge.findMany();
  const userBadgeIds = (await prisma.userBadge.findMany({
    where: {
      userId
    },
    select: {
      badgeId: true
    }
  })).map(b => b.badgeId);
  const badgesToAward = allBadges.filter(badge => !userBadgeIds.includes(badge.id) && shouldAwardBadge(badge.key, ctx)).map(badge => ({
    userId,
    badgeId: badge.id
  }));
  if (badgesToAward.length > 0) {
    await prisma.userBadge.createMany({
      data: badgesToAward
    });
  }

  // Update level
  const {
    level
  } = computeLevel(user.totalCo2Tracked);
  if (user.level !== level) {
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        level
      }
    });
  }
}