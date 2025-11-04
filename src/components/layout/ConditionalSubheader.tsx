'use client';

import { usePathname } from 'next/navigation';
import SubheaderCategories from '@/components/category/Subheader';

export function ConditionalSubheader() {
  const pathname = usePathname();

  const normalizedPath = pathname?.replace(/\/$/, '') || ''; // Remove trailing slash
  const isHomeRoute = normalizedPath === ''
    || normalizedPath === '/vi'
    || normalizedPath === '/en'
    || /^\/[a-z]{2}$/.test(normalizedPath); // Match any 2-letter locale

  if (!isHomeRoute) {
    return null;
  }

  return <SubheaderCategories />;
}
