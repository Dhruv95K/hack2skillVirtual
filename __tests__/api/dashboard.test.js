import { NextRequest } from 'next/server';
import { GET } from '@/app/api/dashboard/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));
jest.mock('@/lib/prisma', () => {
  const mockPrisma = {
    activityLog: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  };
  return {
    prisma: mockPrisma
  };
});
describe('/api/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GET /api/dashboard', () => {
    it('returns 401 if user is not authenticated', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: {
          user: null
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          getUser: mockGetUser
        }
      });
      const request = new NextRequest('http://localhost/api/dashboard', {
        method: 'GET'
      });
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
    it('returns dashboard data with correct shape', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1'
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          getUser: mockGetUser
        }
      });
      prisma.user.findUnique.mockResolvedValue({
        streak: 5,
        level: 2,
        totalCo2Tracked: 5.5
      });
      prisma.activityLog.groupBy.mockResolvedValue([{
        _sum: {
          co2Kg: 10
        },
        category: 'transport'
      }, {
        _sum: {
          co2Kg: 5.5
        },
        category: 'food'
      }]);
      const today = new Date();
      prisma.activityLog.findMany.mockResolvedValue([{
        co2Kg: 5,
        loggedAt: today
      }]);
      prisma.activityLog.aggregate.mockResolvedValue({
        _sum: {
          co2Kg: 5
        }
      });
      const request = new NextRequest('http://localhost/api/dashboard', {
        method: 'GET'
      });
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
      const todayTrend = json.trend.find(t => t.date === todayStr);
      expect(todayTrend.co2Kg).toBe(5);
    });
    it('returns 404 if user not found', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1'
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          getUser: mockGetUser
        }
      });
      prisma.user.findUnique.mockResolvedValue(null);
      const request = new NextRequest('http://localhost/api/dashboard', {
        method: 'GET'
      });
      const response = await GET(request);
      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe('User not found');
    });
    it('returns 500 on internal server error', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1'
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          getUser: mockGetUser
        }
      });
      prisma.user.findUnique.mockRejectedValue(new Error('DB connection failed'));
      const request = new NextRequest('http://localhost/api/dashboard', {
        method: 'GET'
      });
      const response = await GET(request);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Internal Server Error');
    });
    it('handles edge case fallback branches in dashboard data calculation', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1'
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          getUser: mockGetUser
        }
      });

      // totalCo2Tracked = -1 to miss all thresholds and hit levelName fallback
      prisma.user.findUnique.mockResolvedValue({
        streak: 5,
        level: 2,
        totalCo2Tracked: -1
      });

      // Include a non-core category to skip, and a core category with null sum
      prisma.activityLog.groupBy.mockResolvedValue([{
        _sum: {
          co2Kg: null
        },
        category: 'transport'
      }, {
        _sum: {
          co2Kg: 10
        },
        category: 'unknown_category'
      }]);

      // Include an old log outside the trend map dates
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);
      prisma.activityLog.findMany.mockResolvedValue([{
        co2Kg: 5,
        loggedAt: oldDate
      }]);

      // Today aggregate returns null
      prisma.activityLog.aggregate.mockResolvedValue({
        _sum: {
          co2Kg: null
        }
      });
      const request = new NextRequest('http://localhost/api/dashboard', {
        method: 'GET'
      });
      const response = await GET(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.summary.levelName).toBe('Seedling');
      expect(json.summary.todayCo2).toBe(0);
      expect(json.categories.transport).toBe(0); // fell back from null
    });
  });
});