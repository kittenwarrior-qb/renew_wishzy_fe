import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  authService, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData
} from '../services/auth';
import { useAppStore } from '../stores/useAppStore';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'Đã xảy ra lỗi';
  }
  return 'Đã xảy ra lỗi';
};

export const useLogin = () => {
  const router = useRouter();
  const { login: loginStore } = useAppStore();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      console.log('Login response:', data);
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data || {}));
      
      if (!data || !data.accessToken || !data.user) {
        console.error('Invalid login response:', data);
        toast.error('Phản hồi đăng nhập không hợp lệ');
        return;
      }
      
      localStorage.setItem('accessToken', data.accessToken);
      console.log('AccessToken stored in localStorage:', localStorage.getItem('accessToken')); 
      
      loginStore(data.user);
      
      // Check store state after login
      const storeState = useAppStore.getState();
      console.log('Store state after login:', {
        user: storeState.user,
        isAuthenticated: storeState.isAuthenticated
      });
      
      // Show success message
      toast.success(data.message || 'Đăng nhập thành công');
      
      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error: unknown) => {
      console.error('Login error:', error); // Debug log
      const message = getErrorMessage(error) || 'Đăng nhập thất bại';
      toast.error(message);
    },
  });
};

// Register hook
export const useRegister = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Đăng ký thành công');
      router.push('/auth/verify-email');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Đăng ký thất bại';
      toast.error(message);
    },
  });
};

// Verify email hook
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: (data) => {
      toast.success(data.message || 'Email đã được xác thực');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Xác thực email thất bại';
      toast.error(message);
    },
  });
};

// Resend verification hook
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Email xác thực đã được gửi lại');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Gửi lại email thất bại';
      toast.error(message);
    },
  });
};

// Forgot password hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Email đặt lại mật khẩu đã được gửi');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Gửi email thất bại';
      toast.error(message);
    },
  });
};

// Reset password hook
export const useResetPassword = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) => 
      authService.resetPassword(token, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Đặt lại mật khẩu thành công');
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Đặt lại mật khẩu thất bại';
      toast.error(message);
    },
  });
};

// Get profile hook
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: !!localStorage.getItem('accessToken'),
  });
};

// Logout hook
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAppStore();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: (data) => {
      // Clear local storage
      localStorage.removeItem('accessToken');
      
      // Clear Zustand store
      logoutStore();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Show success message
      toast.success(data.message || 'Đăng xuất thành công');
      
      // Redirect to login
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('accessToken');
      logoutStore();
      queryClient.clear();
      
      const message = getErrorMessage(error) || 'Đăng xuất thành công';
      toast.success(message);
      
      router.push('/auth/login');
    },
  });
};

// Refresh token hook (for manual refresh)
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
    },
    onError: () => {
      // If refresh fails, redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/auth/login';
    },
  });
};
