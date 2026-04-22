import createMiddleware from 'next-intl/middleware';
import { routing } from './app/src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);
const API_REQUEST_LOG_INGEST_HEADER_NAME = 'x-ordonsooq-api-log';
const API_REQUEST_LOG_INGEST_HEADER_VALUE = '1';

function isEnabledFlag(value?: string): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === 'on';
}

function isApiRequestLoggingEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && (
    isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING) ||
    isEnabledFlag(process.env.ENABLE_API_REQUEST_LOGGING)
  );
}

async function resetApiRequestLogsForDocumentRequest(request: NextRequest) {
  if (!isApiRequestLoggingEnabled()) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (request.headers.get('sec-fetch-dest') !== 'document') {
    return;
  }

  try {
    await fetch(new URL('/api/internal/request-logs', request.url), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [API_REQUEST_LOG_INGEST_HEADER_NAME]: API_REQUEST_LOG_INGEST_HEADER_VALUE,
      },
      body: JSON.stringify({ type: 'reset' }),
    });
  } catch {
    // Ignore logging reset failures to avoid blocking routing.
  }
}

export default async function middleware(request: NextRequest) {
  await resetApiRequestLogsForDocumentRequest(request);

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
