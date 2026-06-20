import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signInRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  const ip = request.ip || request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
  const { success } = await signInRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const {
    email,
    password
  } = await request.json();
  const supabase = await createClient();
  const {
    data,
    error
  } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) return NextResponse.json({
    error: 'Invalid credentials'
  }, {
    status: 401
  });
  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email
    }
  }, {
    status: 200
  });
}