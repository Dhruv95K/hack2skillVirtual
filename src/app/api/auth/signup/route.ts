import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { email, name, password } = await request.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  // Create user record in our DB
  try {
    await prisma.user.create({ data: { id: data.user!.id, email, name } });
  } catch (err: any) {
    // If user already exists in Prisma but signed up in Supabase (or other db error)
    return NextResponse.json({ error: 'Failed to create user record' }, { status: 400 });
  }
  
  return NextResponse.json({ user: { id: data.user!.id, email, name } }, { status: 201 });
}
