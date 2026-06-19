import { GET } from '@/app/api/gamification/route';
import { NextRequest } from 'next/server';
import { computeLevel } from '@/lib/gamification-engine';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  })
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-user',
        streak: 5,
        totalCo2Tracked: 100,
        userBadges: []
      })
    },
    badge: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', key: 'first_step', name: 'First Step' }
      ])
    }
  }
}));

describe('GET /api/gamification', () => {
  it('returns gamification data', async () => {
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.streak).toBe(5);
    expect(data.level).toBe(computeLevel(100).level);
  });
});
