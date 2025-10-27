import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'uns-auth-token';
const PUBLIC_ROUTES = new Set(['/login']);
const PUBLIC_FILE = /\.(.*)$/;

const isPublicRoute = (pathname: string): boolean => {
  if (PUBLIC_ROUTES.has(pathname)) {
    return true;
  }
  for (const route of PUBLIC_ROUTES) {
    if (pathname.startsWith(`${route}/`)) {
      return true;
    }
  }
  return false;
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

  if (pathname === '/') {
    const target = new URL(token ? '/dashboard' : '/login', request.url);
    return NextResponse.redirect(target);
  }

  if (!token && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    const destination = `${pathname}${search ?? ''}`;
    if (destination && destination !== '/login') {
      loginUrl.searchParams.set('next', destination);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname.startsWith('/login')) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const safeDestination = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard';
    const redirectUrl = new URL(safeDestination, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|assets/).*)',
  ],
};
