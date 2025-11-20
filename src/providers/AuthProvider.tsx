'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { authService } from '@/services/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, logout, isAuthenticated, user } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return;
      }

      if (token && !isAuthenticated) {
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          logout();
        }
      }
    };

    checkAuth();
    // Remove 'user' from dependencies to prevent infinite loop
  }, [setUser, logout, isAuthenticated]);

  return <>{children}</>;
}
