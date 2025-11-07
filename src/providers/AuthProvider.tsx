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
      
      console.log('AuthProvider: Checking auth state');
      console.log('Token exists:', !!token);
      console.log('Current store state:', { isAuthenticated, user: !!user });
      
      if (!token) {
        console.log('No access token found, user not authenticated');
        return;
      }

      // If we have a token but no user in store, fetch profile
      if (token && !isAuthenticated) {
        try {
          console.log('Fetching user profile with token');
          const userProfile = await authService.getProfile();
          console.log('Profile fetched successfully:', userProfile);
          setUser(userProfile);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          logout();
        }
      }
    };

    checkAuth();
  }, [setUser, logout, isAuthenticated, user]);

  return <>{children}</>;
}
