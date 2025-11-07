import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { authService } from '@/services/auth';

export const useAuthCheck = () => {
  const { setUser, logout } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('No access token found');
        return;
      }

      try {
        console.log('Checking auth with token:', token);
        const user = await authService.getProfile();
        console.log('Profile fetched:', user);
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        logout();
      }
    };

    checkAuth();
  }, [setUser, logout]);
};
