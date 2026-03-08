import createMiddleware from 'next-intl/middleware';
import { routing } from './app/src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathSegments = pathname.split('/').filter(Boolean);
  const possibleLocale = pathSegments[0];
  const hasLocalePrefix = routing.locales.includes(possibleLocale as (typeof routing.locales)[number]);
  const locale = hasLocalePrefix ? possibleLocale : routing.defaultLocale;
  const pathnameWithoutLocale = hasLocalePrefix
    ? `/${pathSegments.slice(1).join('/')}` || '/'
    : pathname || '/';

  const protectedRoutes = ['/checkout', '/profile'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // Check for standard server-side tokens and the frontend 'is_logged_in' indicator.
    // OAuth Google login sets HttpOnly cookies that the middleware might miss on first navigation,
    // so we sync an 'is_logged_in' cookie on the client when the profile successfully loads.
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const isLoggedIn = request.cookies.get('is_logged_in')?.value;

    if (!accessToken && !refreshToken && !isLoggedIn) {
      const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`;
      const url = new URL(loginPath, request.url);
      return NextResponse.redirect(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except api, _next, and static files
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - .*\\..* (files with extensions like .js, .css, .png)
    '/((?!api|_next|.*\\..*).*)'
  ]
};
