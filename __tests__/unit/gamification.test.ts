import { computeLevel, shouldAwardBadge, updateStreak, checkAndAwardBadges } from '@/lib/gamification-engine';

describe('computeLevel', () => {
  it('returns level 1 for 0 kg saved', () => expect(computeLevel(0)).toEqual({ level: 1, name: 'Seedling' }));
  it('returns level 2 for 5 kg saved', () => expect(computeLevel(5)).toEqual({ level: 2, name: 'Sprout' }));
  it('returns level 10 for 500 kg saved', () => expect(computeLevel(500)).toEqual({ level: 10, name: 'Carbon Champion' }));
  it('returns level 10 for 1000 kg saved (capped)', () => expect(computeLevel(1000).level).toBe(10));
});

describe('shouldAwardBadge', () => {
  it('awards first_step badge after 1 log', () => { expect(shouldAwardBadge('first_step', { totalLogs: 1, streak: 0, transportLogs: 0, plantLogs: 0, energyLogs: 0, co2Saved: 0 })).toBe(true); });
  it('does not award streak_7 for 6 days', () => { expect(shouldAwardBadge('streak_7', { totalLogs: 6, streak: 6, transportLogs: 0, plantLogs: 0, energyLogs: 0, co2Saved: 0 })).toBe(false); });
  it('awards streak_7 for exactly 7 day streak', () => { expect(shouldAwardBadge('streak_7', { totalLogs: 7, streak: 7, transportLogs: 0, plantLogs: 0, energyLogs: 0, co2Saved: 0 })).toBe(true); });
});
