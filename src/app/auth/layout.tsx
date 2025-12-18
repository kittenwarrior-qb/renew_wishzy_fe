'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/shared/auth/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStatus();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'instructor' || user.isInstructorActive) {
        router.replace('/instructor');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, router]);

  // Show nothing while checking auth or redirecting
  if (isAuthenticated && user) {
    return null;
  }

  return <>{children}</>;
}
