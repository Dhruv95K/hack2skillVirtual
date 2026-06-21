import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/services/dashboard';
export async function GET(request) {
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({
    error: 'Unauthorized'
  }, {
    status: 401
  });
  try {
    const data = await getDashboardData(user.id);
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'User not found') {
      return NextResponse.json({
        error: 'User not found'
      }, {
        status: 404
      });
    }
    return NextResponse.json({
      error: 'Internal Server Error'
    }, {
      status: 500
    });
  }
}