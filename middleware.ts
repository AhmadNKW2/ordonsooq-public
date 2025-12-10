import createMiddleware from 'next-intl/middleware';
import { routing } from './app/src/i18n/routing';

export default createMiddleware(routing);

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
