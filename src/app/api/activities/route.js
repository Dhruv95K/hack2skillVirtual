import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateActivityCO2 } from '@/lib/co2-calculator';
import { checkAndAwardBadges, updateStreak } from '@/lib/gamification-engine';
import { ACTIVITY_UNITS } from '@/lib/constants';
import { activitiesRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
export async function GET(request) {
  // TODO: Decode JWT synchronously to rate-limit by user ID instead of IP to prevent NAT collisions.
  const rateLimitResponse = await checkRateLimit(request, activitiesRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');

  if (!user && !isE2E) return NextResponse.json({
    error: 'Unauthorized'
  }, {
    status: 401
  });
  const userId = user?.id || 'e2e-user';

  let limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);
  if (isNaN(limit) || limit <= 0) {
    limit = 50;
  } else {
    limit = Math.min(limit, 100);
  }
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId
      },
      orderBy: {
        loggedAt: 'desc'
      },
      take: limit
    });
    return NextResponse.json({
      logs
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      error: 'Database operation failed'
    }, {
      status: 500
    });
  }
}
export async function POST(request) {
  // TODO: Decode JWT synchronously to rate-limit by user ID instead of IP to prevent NAT collisions.
  const rateLimitResponse = await checkRateLimit(request, activitiesRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');

  if (!user && !isE2E) return NextResponse.json({
    error: 'Unauthorized'
  }, {
    status: 401
  });
  const userId = user?.id || 'e2e-user';

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      error: 'Invalid JSON'
    }, {
      status: 400
    });
  }

  const activitySchema = z.object({
    category: z.enum(['transport', 'food', 'energy']),
    subType: z.string().min(1, 'subType is required'),
    quantity: z.number().positive('quantity must be a positive number'),
    unit: z.string().min(1, 'unit is required')
  });

  const validation = activitySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({
      error: validation.error?.errors?.[0]?.message || validation.error?.issues?.[0]?.message || 'Invalid input',
      details: validation.error?.errors || validation.error?.issues
    }, {
      status: 400
    });
  }

  const {
    category,
    subType,
    quantity,
    unit
  } = validation.data;

  const expectedUnit = ACTIVITY_UNITS[subType] || ACTIVITY_UNITS[category];
  if (expectedUnit && unit !== expectedUnit) {
    return NextResponse.json({
      error: `Invalid unit for ${subType || category}. Expected ${expectedUnit}`
    }, {
      status: 400
    });
  }
  let co2Kg;
  try {
    co2Kg = calculateActivityCO2(category, subType, quantity);
  } catch {
    return NextResponse.json({
      error: e.message
    }, {
      status: 400
    });
  }
  try {
    if (isE2E) {
      return NextResponse.json({
        log: {
          id: 'mock-log-id',
          userId,
          category,
          subType,
          quantity,
          unit,
          co2Kg,
          loggedAt: new Date().toISOString()
        }
      }, {
        status: 201
      });
    }
    const log = await prisma.$transaction(async tx => {
      const createdLog = await tx.activityLog.create({
        data: {
          userId,
          category,
          subType,
          quantity,
          unit,
          co2Kg
        }
      });
      await tx.user.update({
        where: {
          id: userId
        },
        data: {
          totalCo2Tracked: {
            increment: co2Kg
          }
        }
      });
      return createdLog;
    });
    try {
      if (user) {
        const updatedUser = await updateStreak(user.id);
        await checkAndAwardBadges(user.id, updatedUser);
      }
    } catch (gamificationErr) {
      console.error('Gamification post-transaction error:', gamificationErr);
    }
    return NextResponse.json({
      log
    }, {
      status: 201
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      error: 'Database operation failed'
    }, {
      status: 500
    });
  }
}