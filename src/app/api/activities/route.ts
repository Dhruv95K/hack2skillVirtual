import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateActivityCO2 } from '@/lib/co2-calculator';
import { checkAndAwardBadges, updateStreak } from '@/lib/gamification-engine';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);
  const logs = await prisma.activityLog.findMany({ 
    where: { userId: user.id }, 
    orderBy: { loggedAt: 'desc' }, 
    take: limit 
  });
  
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  const { category, subType, quantity, unit } = body;
  
  if (!category || !subType || quantity == null || !unit) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  let co2Kg: number;
  try { 
    co2Kg = calculateActivityCO2(category, subType, quantity); 
  } catch (e) { 
    return NextResponse.json({ error: (e as Error).message }, { status: 400 }); 
  }
  
  const log = await prisma.activityLog.create({ 
    data: { userId: user.id, category, subType, quantity, unit, co2Kg } 
  });
  
  // Update totals + gamification
  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { totalCo2Saved: { increment: co2Kg } } 
  });
  await updateStreak(user.id);
  await checkAndAwardBadges(user.id);
  
  return NextResponse.json({ log }, { status: 201 });
}
