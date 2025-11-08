import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { authService } from '@/services/auth';

export const useAuthCheck = () => {
  const { setUser, logout } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return;
      }

      try {
        const user = await authService.getProfile();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        logout();
      }
    };

    checkAuth();
  }, [setUser, logout]);
};
