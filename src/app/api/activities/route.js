/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateActivityCO2 } from '@/lib/co2-calculator';
import { checkAndAwardBadges, updateStreak } from '@/lib/gamification-engine';
import { ACTIVITY_UNITS } from '@/lib/constants';
import { activitiesRateLimit } from '@/lib/rate-limit';
export async function GET(request) {
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');
  const identifier = user?.id || request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await activitiesRateLimit.limit(identifier);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

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
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');
  const identifier = user?.id || request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await activitiesRateLimit.limit(identifier);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  if (!user && !isE2E) return NextResponse.json({
    error: 'Unauthorized'
  }, {
    status: 401
  });
  const userId = user?.id || 'e2e-user';

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({
      error: 'Invalid JSON'
    }, {
      status: 400
    });
  }
  const {
    category,
    subType,
    quantity,
    unit
  } = body;
  if (!category || !subType || quantity == null || !unit || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return NextResponse.json({
      error: 'Missing or invalid required fields'
    }, {
      status: 400
    });
  }
  if (!['transport', 'food', 'energy'].includes(category)) {
    return NextResponse.json({
      error: 'Invalid category'
    }, {
      status: 400
    });
  }
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
  } catch (e) {
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