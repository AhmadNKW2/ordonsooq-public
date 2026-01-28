import createMiddleware from 'next-intl/middleware';
import { routing } from './app/src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  // We match against the path without the locale prefix to simplify logic
  // (e.g. /en/checkout -> /checkout)
  const pathnameWithoutLocale = pathname.replace(/^\/(?:en|ar)/, '') || '/';
  
  const protectedRoutes = [
    '/checkout',
    '/profile',
    '/orders'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('access_token');
    
    if (!token) {
      // Get the locale to redirect correctly
      const locale = pathname.match(/^\/(en|ar)/)?.[1] || routing.defaultLocale;
      
      const url = new URL(`/${locale}/login`, request.url);
      
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
