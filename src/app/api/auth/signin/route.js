import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  const rateLimitResponse = await checkRateLimit(request, authRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const {
    email,
    password
  } = body;
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