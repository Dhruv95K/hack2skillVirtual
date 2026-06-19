import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/activities/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { updateStreak, checkAndAwardBadges } from '@/lib/gamification-engine';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockPrisma = {
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
    activityLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1', co2Kg: 17.1 }),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn().mockResolvedValue({}),
    },
  };
  return { prisma: mockPrisma };
});

jest.mock('@/lib/gamification-engine', () => ({
  updateStreak: jest.fn(),
  checkAndAwardBadges: jest.fn(),
}));

describe('/api/activities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/activities', () => {
    it('returns 401 if user is not authenticated', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const request = new NextRequest('http://localhost/api/activities', { method: 'POST', body: JSON.stringify({}) });
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('returns 400 with missing fields', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const request = new NextRequest('http://localhost/api/activities', { 
        method: 'POST', 
        body: JSON.stringify({ category: 'transport' }) 
      });
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('returns 201, saves activity, updates totals and gamification', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      (prisma.activityLog.create as jest.Mock).mockResolvedValue({ id: 'log-1', co2Kg: 17.1 });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/activities', { 
        method: 'POST', 
        body: JSON.stringify({ category: 'transport', subType: 'car_petrol', quantity: 100, unit: 'km' }) 
      });
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      
      expect(prisma.activityLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          category: 'transport',
          subType: 'car_petrol',
          quantity: 100,
          unit: 'km',
          co2Kg: 17.1,
        })
      }));
      
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1' },
        data: { totalCo2Tracked: { increment: 17.1 } }
      }));
      
      expect(updateStreak).toHaveBeenCalledWith('user-1');
      expect(checkAndAwardBadges).toHaveBeenCalledWith('user-1');
    });
  });

  describe('GET /api/activities', () => {
    it('returns 401 if user is not authenticated', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const request = new NextRequest('http://localhost/api/activities', { method: 'GET' });
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('returns user logs, newest first', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const mockLogs = [{ id: 'log-1' }, { id: 'log-2' }];
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/activities', { method: 'GET' });
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ logs: mockLogs });
      
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { loggedAt: 'desc' },
        take: 50,
      });
    });

    it('returns at most 5 logs when limit=5', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/activities?limit=5', { method: 'GET' });
      await GET(request);
      
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        take: 5,
      }));
    });
  });
});
