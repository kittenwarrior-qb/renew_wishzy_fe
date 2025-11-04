'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRefreshToken } from '@/components/auth/useAuth';

export function AuthInitializer() {
  const { isAuthenticated, token, hadAuthenticatedSession } = useAuthStore();
  const refresh = useRefreshToken();

  useEffect(() => {
    // Only attempt refresh on boot if the user had a prior authenticated session.
    // This avoids hitting refresh after explicit logout.
    if (hadAuthenticatedSession && (!isAuthenticated || !token)) {
      // Fire and forget; backend will use httpOnly refresh cookie
      refresh.mutate(undefined, { onError: () => {} });
    }
    // We intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}


