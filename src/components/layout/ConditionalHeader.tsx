'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthRoute = pathname?.includes('/sign-in') || pathname?.includes('/verify-email');

  if (isAuthRoute) {
    return null;
  }

  return <Header />;
}
