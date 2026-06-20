import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  const rateLimitResponse = await checkRateLimit(request, authRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

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