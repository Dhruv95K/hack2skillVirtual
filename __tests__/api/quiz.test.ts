import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/quiz/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateBaseline } from '@/lib/co2-calculator';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    quizResponse: {
      count: jest.fn(),
      createMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/co2-calculator', () => ({
  calculateBaseline: jest.fn(),
}));

describe('POST /api/quiz', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('returns 401 if user is not authenticated', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({ responses: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 422 when required quiz answers are missing', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'car_petrol',
          weekly_km: 100,
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe('Missing required quiz responses');
    expect(prisma.quizResponse.createMany).not.toHaveBeenCalled();
  });

  it('returns 409 if the user already completed the quiz', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'car_petrol',
          weekly_km: 100,
          flights_per_year: 1,
          diet_type: 'vegan',
          meat_meals_per_week: 0,
          home_size: '2bedroom',
          monthly_electricity_kwh: 200,
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe('Quiz already completed');
    expect(prisma.quizResponse.createMany).not.toHaveBeenCalled();
  });

  it('saves responses, updates user baseline, and returns success', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);
    
    const mockBaseline = { total: 1000, transport: 400, food: 300, energy: 300 };
    (calculateBaseline as jest.Mock).mockReturnValue(mockBaseline);

    const responses = {
      primary_transport: 'car_petrol',
      weekly_km: 100,
      flights_per_year: 1,
      diet_type: 'vegan',
      meat_meals_per_week: 0,
      home_size: '2bedroom',
      monthly_electricity_kwh: 200,
    };

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.baseline).toEqual(mockBaseline);
    
    // Check if responses were saved correctly
    expect(prisma.quizResponse.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'user-1', category: 'transport', questionKey: 'primary_transport', answer: 'car_petrol' },
        { userId: 'user-1', category: 'transport', questionKey: 'weekly_km', answer: '100' },
        { userId: 'user-1', category: 'transport', questionKey: 'flights_per_year', answer: '1' },
        { userId: 'user-1', category: 'food', questionKey: 'diet_type', answer: 'vegan' },
        { userId: 'user-1', category: 'food', questionKey: 'meat_meals_per_week', answer: '0' },
        { userId: 'user-1', category: 'energy', questionKey: 'home_size', answer: '2bedroom' },
        { userId: 'user-1', category: 'energy', questionKey: 'monthly_electricity_kwh', answer: '200' },
      ]
    });

    // Check if user's baseline total was updated
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { totalCo2Saved: 0 },
    });
  });
});
