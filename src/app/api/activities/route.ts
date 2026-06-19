import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateActivityCO2 } from '@/lib/co2-calculator';
import { checkAndAwardBadges, updateStreak } from '@/lib/gamification-engine';
import { ACTIVITY_UNITS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  let limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);
  if (isNaN(limit) || limit <= 0) {
    limit = 50;
  } else {
    limit = Math.min(limit, 100);
  }
  try {
    const logs = await prisma.activityLog.findMany({ 
      where: { userId: user.id }, 
      orderBy: { loggedAt: 'desc' }, 
      take: limit 
    });
    return NextResponse.json({ logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { category, subType, quantity, unit } = body;
  
  if (!category || !subType || quantity == null || !unit || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }

  const expectedUnit = (ACTIVITY_UNITS as any)[subType] || (ACTIVITY_UNITS as any)[category];
  if (expectedUnit && unit !== expectedUnit) {
    return NextResponse.json({ error: `Invalid unit for ${subType || category}. Expected ${expectedUnit}` }, { status: 400 });
  }
  
  let co2Kg: number;
  try { 
    co2Kg = calculateActivityCO2(category, subType, quantity); 
  } catch (e) { 
    return NextResponse.json({ error: (e as Error).message }, { status: 400 }); 
  }
  
  try {
    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.activityLog.create({ 
        data: { userId: user.id, category, subType, quantity, unit, co2Kg } 
      });
      
      await tx.user.update({ 
        where: { id: user.id }, 
        data: { totalCo2Tracked: { increment: co2Kg } } 
      });
      
      return createdLog;
    });

    try {
      await updateStreak(user.id);
      await checkAndAwardBadges(user.id);
    } catch (gamificationErr) {
      console.error('Gamification post-transaction error:', gamificationErr);
    }
    
    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}
