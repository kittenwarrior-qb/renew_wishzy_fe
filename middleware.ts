import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['vi', 'en'];
const defaultLocale = 'vi';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (hasLocale) {
    return NextResponse.next();
  }
  
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }
  
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', '/']
};
