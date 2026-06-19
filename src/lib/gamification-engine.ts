import { LEVEL_THRESHOLDS, BADGE_DEFINITIONS } from './gamification';
import { prisma } from './prisma';

export function computeLevel(co2Saved: number): { level: number; name: string } {
  const thresholds = [...LEVEL_THRESHOLDS].reverse();
  const found = thresholds.find(t => co2Saved >= t.minCO2Tracked);
  return found ? { level: found.level, name: found.name } : { level: 1, name: 'Seedling' };
}

interface BadgeContext { totalLogs: number; streak: number; transportLogs: number; plantLogs: number; energyLogs: number; co2Saved: number; }
export function shouldAwardBadge(badgeKey: string, ctx: BadgeContext): boolean {
  const def = BADGE_DEFINITIONS.find(b => b.key === badgeKey);
  if (!def) return false;
  switch (def.thresholdType) {
    case 'total_logs': return ctx.totalLogs >= def.thresholdValue;
    case 'streak': return ctx.streak >= def.thresholdValue;
    case 'transport_logs': return ctx.transportLogs >= def.thresholdValue;
    case 'plant_logs': return ctx.plantLogs >= def.thresholdValue;
    case 'energy_logs': return ctx.energyLogs >= def.thresholdValue;
    case 'co2_saved':
    case 'co2_tracked': return ctx.co2Saved >= def.thresholdValue;
    default: return false;
  }
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const lastLogged = user.lastLoggedAt ? new Date(user.lastLoggedAt) : null;
  if (lastLogged) { lastLogged.setHours(0,0,0,0); }
  const daysDiff = lastLogged ? Math.floor((today.getTime() - lastLogged.getTime()) / 86400000) : null;
  let newStreak = user.streak;
  if (daysDiff === null || daysDiff > 1) newStreak = 1;        // first log or gap > 1 day
  else if (daysDiff === 1) newStreak = user.streak + 1;         // consecutive day
  // daysDiff === 0: same day, streak unchanged
  await prisma.user.update({ where: { id: userId }, data: { streak: newStreak, lastLoggedAt: new Date() } });
}

export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const totalLogs = await prisma.activityLog.count({ where: { userId } });
  const transportLogs = await prisma.activityLog.count({ where: { userId, category: 'transport' } });
  const energyLogs = await prisma.activityLog.count({ where: { userId, category: 'energy' } });
  const plantLogs = await prisma.activityLog.count({ where: { userId, category: 'food', subType: 'plant_based_meal' } });
  const ctx: BadgeContext = { totalLogs, streak: user.streak, transportLogs, plantLogs, energyLogs, co2Saved: user.totalCo2Tracked };
  const allBadges = await prisma.badge.findMany();
  const userBadgeIds = (await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map(b => b.badgeId);
  for (const badge of allBadges) {
    if (!userBadgeIds.includes(badge.id) && shouldAwardBadge(badge.key, ctx)) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    }
  }
  // Update level
  const { level } = computeLevel(user.totalCo2Tracked);
  await prisma.user.update({ where: { id: userId }, data: { level } });
}
