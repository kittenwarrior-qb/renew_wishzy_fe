import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware({
  ...routing,
  localeDetection: false, // Disable automatic locale detection
});

// Next.js 16 proxy.ts format
// Note: Webpack doesn't support proxy.ts on Vercel yet, but this is the recommended format for Next.js 16
export default async function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
