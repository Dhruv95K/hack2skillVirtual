import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateBaseline } from '@/lib/co2-calculator';

const REQUIRED_RESPONSE_KEYS = [
  'primary_transport',
  'weekly_km',
  'flights_per_year',
  'diet_type',
  'meat_meals_per_week',
  'home_size',
  'monthly_electricity_kwh',
] as const;

const QUESTION_CATEGORY_BY_KEY: Record<(typeof REQUIRED_RESPONSE_KEYS)[number], string> = {
  primary_transport: 'transport',
  weekly_km: 'transport',
  flights_per_year: 'transport',
  diet_type: 'food',
  meat_meals_per_week: 'food',
  home_size: 'energy',
  monthly_electricity_kwh: 'energy',
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonWithRequestId({ error: 'Unauthorized' }, 401, requestId);
    }

    const body = await request.json().catch(() => null);
    const responses = body?.responses;

    if (!hasRequiredResponses(responses)) {
      console.warn('[quiz] rejected incomplete submission', {
        requestId,
        providedKeys:
          responses && typeof responses === 'object'
            ? Object.keys(responses as Record<string, unknown>)
            : [],
      });
      return jsonWithRequestId(
        { error: 'Missing required quiz responses' },
        422,
        requestId
      );
    }

    const existingResponsesCount = await prisma.quizResponse.count({
      where: { userId: user.id },
    });

    if (existingResponsesCount > 0) {
      console.info('[quiz] duplicate submission ignored', { requestId });
      return jsonWithRequestId({ error: 'Quiz already completed' }, 409, requestId);
    }

    const normalizedResponses = {
      primary_transport: String(responses.primary_transport),
      weekly_km: Number(responses.weekly_km),
      flights_per_year: Number(responses.flights_per_year),
      diet_type: String(responses.diet_type),
      meat_meals_per_week: Number(responses.meat_meals_per_week),
      home_size: String(responses.home_size),
      monthly_electricity_kwh: Number(responses.monthly_electricity_kwh),
    };

    const baseline = calculateBaseline(normalizedResponses);

    await prisma.quizResponse.createMany({
      data: REQUIRED_RESPONSE_KEYS.map((key) => ({
        userId: user.id,
        category: QUESTION_CATEGORY_BY_KEY[key],
        questionKey: key,
        answer: String(normalizedResponses[key]),
      })),
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { totalCo2Saved: 0 },
    });

    console.info('[quiz] baseline saved', {
      requestId,
      questionCount: REQUIRED_RESPONSE_KEYS.length,
      baselineTotalKg: baseline.total,
    });

    return jsonWithRequestId({ success: true, baseline }, 200, requestId);
  } catch (error) {
    console.error('[quiz] submission failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return jsonWithRequestId({ error: 'Failed to save quiz responses' }, 500, requestId);
  }
}

function hasRequiredResponses(
  responses: unknown
): responses is Record<(typeof REQUIRED_RESPONSE_KEYS)[number], string | number> {
  if (!responses || typeof responses !== 'object') {
    return false;
  }

  return REQUIRED_RESPONSE_KEYS.every((key) => {
    const value = (responses as Record<string, unknown>)[key];

    if (typeof value === 'number') {
      return Number.isFinite(value) && value >= 0;
    }

    return typeof value === 'string' && value.trim().length > 0;
  });
}

function jsonWithRequestId(body: Record<string, unknown>, status: number, requestId: string) {
  return NextResponse.json(body, {
    status,
    headers: {
      'x-request-id': requestId,
    },
  });
}
