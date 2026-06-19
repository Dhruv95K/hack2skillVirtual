import { NextRequest } from 'next/server';
import { POST } from '@/app/api/insights/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockPrisma: any = {
    activityLog: {
      findMany: jest.fn(),
    },
    aiInsight: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  return { prisma: mockPrisma };
});

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('/api/insights', () => {
  let consoleInfoSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterAll(() => {
    consoleInfoSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  it('returns 401 if user is not authenticated', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('returns tips with the expected shape', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'log-1',
        category: 'transport',
        subType: 'car_petrol',
        quantity: 18,
        unit: 'km',
        co2Kg: 4.2,
        loggedAt: new Date('2026-06-18T09:00:00.000Z'),
      },
      {
        id: 'log-2',
        category: 'food',
        subType: 'beef',
        quantity: 2,
        unit: 'meals',
        co2Kg: 3.1,
        loggedAt: new Date('2026-06-17T12:00:00.000Z'),
      },
    ]);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            {
              title: 'Swap two short car trips for a walk',
              description: 'Your recent transport entries are leading your footprint. Replace two nearby drives this week with a walk or cycle to trim fuel use without changing your routine much.',
              estimatedSavingKg: 2.4,
              category: 'transport',
            },
            {
              title: 'Make one beef meal plant-based',
              description: 'Food is your next biggest source this week. Replacing one beef-heavy meal with lentils or beans can cut emissions and still fit a normal dinner plan.',
              estimatedSavingKg: 1.8,
              category: 'food',
            },
            {
              title: 'Batch errands into one drive',
              description: 'Your transport logs show repeated short trips. Combining errands into one loop reduces cold starts and quickly lowers the CO2 from weekly driving.',
              estimatedSavingKg: 1.2,
              category: 'transport',
            },
          ]),
      },
    });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      tips: [
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          estimatedSavingKg: expect.any(Number),
          category: expect.stringMatching(/^(transport|food|energy)$/),
        }),
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          estimatedSavingKg: expect.any(Number),
          category: expect.stringMatching(/^(transport|food|energy)$/),
        }),
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          estimatedSavingKg: expect.any(Number),
          category: expect.stringMatching(/^(transport|food|energy)$/),
        }),
      ],
    });

    expect(prisma.activityLog.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { loggedAt: 'desc' },
      take: 20,
    });
  });

  it('saves the generated Gemini response to ai_insights', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-7' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'log-9',
        category: 'energy',
        subType: 'electricity',
        quantity: 120,
        unit: 'kWh',
        co2Kg: 10.5,
        loggedAt: new Date('2026-06-18T18:00:00.000Z'),
      },
    ]);

    const generatedTips = [
      {
        title: 'Trim peak electricity use',
        description: 'Energy is your top category right now. Running heavy appliances outside peak evening hours can reduce wasted standby and cooling load with little effort.',
        estimatedSavingKg: 3.5,
        category: 'energy',
      },
      {
        title: 'Raise AC by one degree',
        description: 'A small thermostat change is one of the easiest energy wins. Pair it with a fan for comfort and steady daily CO2 savings.',
        estimatedSavingKg: 2.1,
        category: 'energy',
      },
      {
        title: 'Switch off idle devices overnight',
        description: 'Your household energy use suggests standby draw is worth tackling. A nightly shutoff habit for chargers and entertainment gear can add up quickly.',
        estimatedSavingKg: 0.9,
        category: 'energy',
      },
    ];

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(generatedTips),
      },
    });

    (prisma.aiInsight.create as jest.Mock).mockResolvedValue({
      id: 'insight-1',
    });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.aiInsight.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-7',
        content: JSON.stringify(generatedTips),
      },
    });
  });

  it('returns an empty tips payload when the user has no activity logs', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      tips: [],
      message: 'Log some activities first to get personalized insights!',
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(prisma.aiInsight.create).not.toHaveBeenCalled();
  });
});
