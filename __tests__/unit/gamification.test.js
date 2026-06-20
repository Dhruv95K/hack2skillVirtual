import { computeLevel, shouldAwardBadge, updateStreak, checkAndAwardBadges } from '@/lib/gamification-engine';
import { prisma } from '@/lib/prisma';
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    activityLog: {
      count: jest.fn()
    },
    badge: {
      findMany: jest.fn()
    },
    userBadge: {
      findMany: jest.fn(),
      createMany: jest.fn()
    }
  }
}));
beforeEach(() => {
  jest.clearAllMocks();
});
describe('computeLevel', () => {
  it('returns level 1 for 0 kg saved', () => expect(computeLevel(0)).toEqual({
    level: 1,
    name: 'Seedling'
  }));
  it('returns level 2 for 5 kg saved', () => expect(computeLevel(5)).toEqual({
    level: 2,
    name: 'Sprout'
  }));
  it('returns level 10 for 500 kg saved', () => expect(computeLevel(500)).toEqual({
    level: 10,
    name: 'Carbon Champion'
  }));
  it('returns level 10 for 1000 kg saved (capped)', () => expect(computeLevel(1000).level).toBe(10));
});
describe('shouldAwardBadge', () => {
  it('awards first_step badge after 1 log', () => {
    expect(shouldAwardBadge('first_step', {
      totalLogs: 1,
      streak: 0,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 0
    })).toBe(true);
  });
  it('does not award streak_7 for 6 days', () => {
    expect(shouldAwardBadge('streak_7', {
      totalLogs: 6,
      streak: 6,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 0
    })).toBe(false);
  });
  it('awards streak_7 for exactly 7 day streak', () => {
    expect(shouldAwardBadge('streak_7', {
      totalLogs: 7,
      streak: 7,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 0
    })).toBe(true);
  });
  it('handles transport_logs', () => {
    expect(shouldAwardBadge('green_commuter', {
      totalLogs: 10,
      streak: 0,
      transportLogs: 10,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 0
    })).toBe(true);
  });
  it('handles plant_logs', () => {
    expect(shouldAwardBadge('plant_power', {
      totalLogs: 10,
      streak: 0,
      transportLogs: 0,
      plantLogs: 10,
      energyLogs: 0,
      co2Saved: 0
    })).toBe(true);
  });
  it('handles energy_logs', () => {
    expect(shouldAwardBadge('energy_saver', {
      totalLogs: 10,
      streak: 0,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 10,
      co2Saved: 0
    })).toBe(true);
  });
  it('handles co2_saved', () => {
    expect(shouldAwardBadge('carbon_crusher', {
      totalLogs: 10,
      streak: 0,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 100
    })).toBe(true);
  });
  it('returns false for unknown badge key', () => {
    expect(shouldAwardBadge('unknown', {
      totalLogs: 10,
      streak: 0,
      transportLogs: 0,
      plantLogs: 0,
      energyLogs: 0,
      co2Saved: 100
    })).toBe(false);
  });
});
describe('updateStreak', () => {
  it('returns null if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    expect(await updateStreak('u1')).toBeNull();
  });
  it('sets streak to 1 if first log ever', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      streak: 0,
      lastLoggedAt: null
    });
    prisma.user.update.mockResolvedValue({
      streak: 1
    });
    const res = await updateStreak('u1');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        streak: 1
      })
    }));
    expect(res).toEqual({
      streak: 1
    });
  });
  it('increments streak if logged yesterday', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      streak: 1,
      lastLoggedAt: yesterday
    });
    prisma.user.update.mockResolvedValue({
      streak: 2
    });
    await updateStreak('u1');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        streak: 2
      })
    }));
  });
  it('resets streak to 1 if gap is more than 1 day', async () => {
    const lastWeek = new Date();
    lastWeek.setUTCDate(lastWeek.getUTCDate() - 5);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      streak: 10,
      lastLoggedAt: lastWeek
    });
    prisma.user.update.mockResolvedValue({
      streak: 1
    });
    await updateStreak('u1');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        streak: 1
      })
    }));
  });
  it('does nothing and returns user if already logged today', async () => {
    const today = new Date();
    const user = {
      id: 'u1',
      streak: 5,
      lastLoggedAt: today
    };
    prisma.user.findUnique.mockResolvedValue(user);
    const res = await updateStreak('u1');
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(res).toEqual(user);
  });
});
describe('checkAndAwardBadges', () => {
  it('awards badges and updates level', async () => {
    const mockUser = {
      id: 'u1',
      streak: 5,
      totalCo2Tracked: 100,
      level: 1
    };
    prisma.activityLog.count.mockImplementation(({
      where
    }) => {
      if (where.category) return Promise.resolve(0);
      return Promise.resolve(10); // totalLogs = 10
    });
    const allBadges = [{
      id: 'b1',
      key: 'first_step',
      thresholdType: 'total_logs',
      thresholdValue: 1
    }, {
      id: 'b2',
      key: 'streak_7',
      thresholdType: 'streak',
      thresholdValue: 7
    }];
    prisma.badge.findMany.mockResolvedValue(allBadges);
    prisma.userBadge.findMany.mockResolvedValue([]);
    await checkAndAwardBadges('u1', mockUser);

    // should award first_step but not streak_7
    expect(prisma.userBadge.createMany).toHaveBeenCalledWith({
      data: [{
        userId: 'u1',
        badgeId: 'b1'
      }]
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 'u1'
      },
      data: {
        level: expect.any(Number)
      }
    });
  });
  it('does not award badges if already earned', async () => {
    const mockUser = {
      id: 'u1',
      streak: 5,
      totalCo2Tracked: 100,
      level: 7
    }; // level 7 matches 100kg
    prisma.activityLog.count.mockResolvedValue(10);
    const allBadges = [{
      id: 'b1',
      key: 'first_step',
      thresholdType: 'total_logs',
      thresholdValue: 1
    }];
    prisma.badge.findMany.mockResolvedValue(allBadges);
    prisma.userBadge.findMany.mockResolvedValue([{
      badgeId: 'b1'
    }]); // already has it

    await checkAndAwardBadges('u1', mockUser);
    expect(prisma.userBadge.createMany).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});