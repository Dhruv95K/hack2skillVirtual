import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = ['/dashboard', '/log', '/quiz', '/insights', '/gamification', '/offsets'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const isE2E = process.env.NODE_ENV !== 'production' && request.cookies.has('e2e-mock-auth');
  const isProtected = PROTECTED_ROUTES.some(r => request.nextUrl.pathname.startsWith(r));

  if (isProtected && !user && !isE2E) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  if ((request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup') && (user || isE2E)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/log/:path*', '/quiz/:path*', '/insights/:path*', '/gamification/:path*', '/offsets/:path*', '/signin', '/signup'],
};
