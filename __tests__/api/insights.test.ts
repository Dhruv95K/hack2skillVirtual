import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/insights/route';
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
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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

  it('rejects Gemini responses that do not contain between 3 and 5 valid tips', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-3' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'log-10',
        category: 'transport',
        subType: 'train',
        quantity: 12,
        unit: 'km',
        co2Kg: 0.5,
        loggedAt: new Date('2026-06-18T18:00:00.000Z'),
      },
    ]);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            {
              title: 'Take the train for short commutes',
              description: 'Rail remains a strong option for cutting emissions on your routine trips.',
              estimatedSavingKg: 1.2,
              category: 'transport',
            },
            {
              title: 'Combine errands',
              description: 'Grouping stops into one trip can trim repeat starts and save fuel.',
              estimatedSavingKg: 0.9,
              category: 'transport',
            },
          ]),
      },
    });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(prisma.aiInsight.create).not.toHaveBeenCalled();
  });

  it('rejects Gemini responses with more than 5 tips', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-4' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'log-11',
        category: 'food',
        subType: 'plant_based_meal',
        quantity: 2,
        unit: 'meals',
        co2Kg: 1.0,
        loggedAt: new Date('2026-06-18T18:00:00.000Z'),
      },
    ]);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            { title: 'Tip 1', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
            { title: 'Tip 2', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
            { title: 'Tip 3', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
            { title: 'Tip 4', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
            { title: 'Tip 5', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
            { title: 'Tip 6', description: 'd', estimatedSavingKg: 1.1, category: 'food' },
          ]),
      },
    });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(prisma.aiInsight.create).not.toHaveBeenCalled();
  });

  it('rejects Gemini tips with invalid estimated savings', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-5' } }, error: null });
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'log-12',
        category: 'energy',
        subType: 'electricity',
        quantity: 150,
        unit: 'kWh',
        co2Kg: 12.3,
        loggedAt: new Date('2026-06-18T18:00:00.000Z'),
      },
    ]);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            { title: 'Tip 1', description: 'd', estimatedSavingKg: -1.2, category: 'energy' },
            { title: 'Tip 2', description: 'd', estimatedSavingKg: 1.1, category: 'energy' },
            { title: 'Tip 3', description: 'd', estimatedSavingKg: 1.1, category: 'energy' },
          ]),
      },
    });

    const request = new NextRequest('http://localhost/api/insights', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(prisma.aiInsight.create).not.toHaveBeenCalled();
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

  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('returns saved insight with serialized generatedAt', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const mockDate = new Date('2026-06-19T10:00:00.000Z');
      (prisma.aiInsight.findFirst as jest.Mock).mockResolvedValue({
        id: 'insight-1',
        userId: 'user-1',
        content: JSON.stringify([
          { title: 'Test Tip', description: 'Test desc', estimatedSavingKg: 1.5, category: 'energy' },
        ]),
        generatedAt: mockDate,
      });

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        tips: [
          { title: 'Test Tip', description: 'Test desc', estimatedSavingKg: 1.5, category: 'energy' },
        ],
        generatedAt: mockDate.toISOString(),
      });
      expect(prisma.aiInsight.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { generatedAt: 'desc' },
      });
    });

    it('handles malformed persisted content by returning empty tips', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const mockDate = new Date('2026-06-19T10:00:00.000Z');
      (prisma.aiInsight.findFirst as jest.Mock).mockResolvedValue({
        id: 'insight-2',
        userId: 'user-1',
        content: 'not-valid-json',
        generatedAt: mockDate,
      });

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.tips).toEqual([]);
      expect(json.generatedAt).toBe(mockDate.toISOString());
    });

    it('handles partially malformed JSON array by returning valid tips and ignoring invalid ones', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      const mockDate = new Date('2026-06-19T10:00:00.000Z');
      (prisma.aiInsight.findFirst as jest.Mock).mockResolvedValue({
        id: 'insight-3',
        userId: 'user-1',
        content: JSON.stringify([
          { title: 'Valid Tip', description: 'Good', estimatedSavingKg: 2, category: 'food' },
          { title: 'Invalid Tip' }, // missing fields
          'not an object'
        ]),
        generatedAt: mockDate,
      });

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.tips).toEqual([
        { title: 'Valid Tip', description: 'Good', estimatedSavingKg: 2, category: 'food' },
      ]);
      expect(json.generatedAt).toBe(mockDate.toISOString());
    });

    it('returns empty message if no insight exists and no logs exist', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      (prisma.aiInsight.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        tips: [],
        generatedAt: null,
        message: 'Log some activities first to get personalized insights!',
      });
    });

    it('returns prompt message if no insight exists but logs exist', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });

      (prisma.aiInsight.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([{ id: 'log-1' }]);

      const request = new NextRequest('http://localhost/api/insights', { method: 'GET' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        tips: [],
        generatedAt: null,
        message: 'Generate personalized tips from your latest activity logs.',
      });
    });
  });
});
