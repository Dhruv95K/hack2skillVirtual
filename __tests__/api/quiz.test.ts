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
    $transaction: jest.fn(),
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
  const originalE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.E2E_AUTH_BYPASS_ENABLED = 'true';
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env.E2E_AUTH_BYPASS_ENABLED = originalE2EAuthBypassEnabled;
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

  it('returns 422 when a select answer is outside the allowed quiz options', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'spaceship',
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

    expect(response.status).toBe(422);
    expect(json.error).toBe('Invalid quiz response values');
    expect(calculateBaseline).not.toHaveBeenCalled();
  });

  it('returns 422 when a numeric answer is not a finite number', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'car_petrol',
          weekly_km: 'not-a-number',
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

    expect(response.status).toBe(422);
    expect(json.error).toBe('Invalid quiz response values');
    expect(calculateBaseline).not.toHaveBeenCalled();
  });

  it('returns 422 when an integer-only answer is fractional', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'car_petrol',
          weekly_km: 100,
          flights_per_year: 1.5,
          diet_type: 'vegan',
          meat_meals_per_week: 0,
          home_size: '2bedroom',
          monthly_electricity_kwh: 200,
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe('Invalid quiz response values');
  });

  it('returns 422 when a numeric answer exceeds the realistic bounds', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          primary_transport: 'car_petrol',
          weekly_km: 100,
          flights_per_year: 1,
          diet_type: 'vegan',
          meat_meals_per_week: 22,
          home_size: '2bedroom',
          monthly_electricity_kwh: 200,
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe('Invalid quiz response values');
  });

  it('returns 409 if a concurrent submission loses to the unique write constraint', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);
    (calculateBaseline as jest.Mock).mockReturnValue({
      total: 1000,
      transport: 400,
      food: 300,
      energy: 300,
    });
    (prisma.$transaction as jest.Mock).mockRejectedValue({ code: 'P2002' });

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
  });

  it('uses the real route in e2e mode and marks quiz completion via cookie', async () => {
    const mockBaseline = { total: 1000, transport: 400, food: 300, energy: 300 };
    (calculateBaseline as jest.Mock).mockReturnValue(mockBaseline);

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      headers: {
        cookie: 'e2e-mock-auth=true',
      },
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

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true, baseline: mockBaseline });
    expect(response.cookies.get('e2e-quiz-complete')?.value).toBe('true');
    expect(createClient).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('saves responses, updates user baseline, and returns success', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
    (prisma.quizResponse.count as jest.Mock).mockResolvedValue(0);
    
    const mockBaseline = { total: 1000, transport: 400, food: 300, energy: 300 };
    (calculateBaseline as jest.Mock).mockReturnValue(mockBaseline);
    const transactionQuizCreateMany = jest.fn().mockResolvedValue(undefined);
    const transactionUserUpdate = jest.fn().mockResolvedValue(undefined);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) =>
      callback({
        quizResponse: { createMany: transactionQuizCreateMany },
        user: { update: transactionUserUpdate },
      })
    );

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
    
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionQuizCreateMany).toHaveBeenCalledWith({
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
    expect(transactionUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { totalCo2Tracked: 0 },
    });
  });
});
