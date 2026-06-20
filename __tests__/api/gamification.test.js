import { GET } from '@/app/api/gamification/route';
import { NextRequest } from 'next/server';
import { computeLevel } from '@/lib/gamification-engine';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user'
          }
        }
      })
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
      findMany: jest.fn().mockResolvedValue([{
        id: '1',
        key: 'first_step',
        name: 'First Step'
      }])
    }
  }
}));
describe('GET /api/gamification', () => {
  let consoleErrorSpy;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  it('returns gamification data', async () => {
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.streak).toBe(5);
    expect(data.level).toBe(computeLevel(100).level);
  });
  it('returns 404 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });
  it('returns 500 on database error', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('DB connection failed'));
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
  it('returns 401 if user is not authenticated', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: {
        user: null
      },
      error: null
    });
    createClient.mockResolvedValueOnce({
      auth: {
        getUser: mockGetUser
      }
    });
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
  it('handles max level where next level is undefined', async () => {
    // Max level threshold is 500. So 1000 means level 10 (max)
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'test-user-max',
      streak: 5,
      totalCo2Tracked: 1000,
      userBadges: []
    });
    const req = new NextRequest('http://localhost:3000/api/gamification');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.level).toBe(10);
    expect(data.nextLevelName).toBeNull();
    expect(data.nextLevelThreshold).toBeNull();
  });
});