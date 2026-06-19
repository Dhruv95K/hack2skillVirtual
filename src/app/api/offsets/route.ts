import { NextResponse } from 'next/server';
import { OFFSET_PROGRAMS } from '@/lib/offsets';

export async function GET() {
  console.info('[offsets] fetched programs list', { count: OFFSET_PROGRAMS.length });
  return NextResponse.json({ programs: OFFSET_PROGRAMS });
}
