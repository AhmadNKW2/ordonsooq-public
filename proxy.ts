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
    // Check for access_token OR refresh_token.
    // The access_token is short-lived (~15 min); after it expires the backend uses
    // the refresh_token to silently issue a new one. We must not block the user
    // here just because the access_token expired — the client will refresh it.
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!accessToken && !refreshToken) {
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
