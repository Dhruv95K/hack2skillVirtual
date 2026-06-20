/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
const PROTECTED_ROUTES = ['/dashboard', '/log', '/quiz', '/insights', '/gamification'];
export async function middleware(request) {
  const response = NextResponse.next({
    request
  });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: c => c.forEach(({
        name,
        value,
        options
      }) => response.cookies.set(name, value, options))
    }
  });
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');
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
  matcher: ['/dashboard/:path*', '/log/:path*', '/quiz/:path*', '/insights/:path*', '/gamification/:path*', '/signin', '/signup']
};