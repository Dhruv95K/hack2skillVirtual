import { NextRequest } from 'next/server';
import { GET } from '@/app/api/dashboard/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockPrisma: any = {
    activityLog: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  return { prisma: mockPrisma };
});

describe('/api/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard', () => {
    it('returns 401 if user is not authenticated', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const request = new NextRequest('http://localhost/api/dashboard', { method: 'GET' });
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('returns dashboard data with correct shape', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        streak: 5,
        level: 2,
        totalCo2Tracked: 5.5
      });

      (prisma.activityLog.groupBy as jest.Mock).mockResolvedValue([
        { _sum: { co2Kg: 10 }, category: 'transport' },
        { _sum: { co2Kg: 5.5 }, category: 'food' }
      ]);

      const today = new Date();
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
        { co2Kg: 5, loggedAt: today }
      ]);

      (prisma.activityLog.aggregate as jest.Mock).mockResolvedValue({
        _sum: { co2Kg: 5 }
      });

      const request = new NextRequest('http://localhost/api/dashboard', { method: 'GET' });
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.summary).toEqual(expect.objectContaining({
        totalCo2Tracked: 5.5,
        streak: 5,
        level: 2,
        levelName: 'Sprout',
        todayCo2: 5
      }));

      expect(json.categories).toEqual({
        transport: 10,
        food: 5.5,
        energy: 0
      });

      expect(json.trend.length).toBe(30);
      const todayStr = today.toISOString().split('T')[0];
      const todayTrend = json.trend.find((t: any) => t.date === todayStr);
      expect(todayTrend.co2Kg).toBe(5);
    });
  });
});
