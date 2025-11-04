'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  // Ẩn header ở tất cả auth routes
  const isAuthRoute = pathname?.includes('/sign-in')
    || pathname?.includes('/sign-up')
    || pathname?.includes('/verify-email')
    || pathname?.includes('/reset-password')
    || pathname?.includes('/forgot-password');

  if (isAuthRoute) {
    return null;
  }

  return <Header />;
}
