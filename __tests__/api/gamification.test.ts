import { GET } from '@/app/api/gamification/route';
import { NextRequest } from 'next/server';
import { computeLevel } from '@/lib/gamification-engine';
import { prisma } from '@/lib/prisma';

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

  it('returns 404 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 500 on database error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
