import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';
import { wishzyAuthService } from '@/services/auth';
import type { 
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  VerifyEmailResponse,
  ResendVerificationData,
  ResendVerificationResponse,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  RefreshTokenResponse,
  LogoutResponse,
  User
} from '@/types/auth';

// Wishzy Auth Hooks - Full Flow Implementation

// Error handling utility
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'Đã xảy ra lỗi';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi';
};

/**
 * Login Hook
 * POST /auth/login
 */
export const useLogin = () => {
  const router = useRouter();
  const { login: loginStore } = useAppStore();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => wishzyAuthService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      if (!data || !data.accessToken || !data.user) {
        toast.error('Phản hồi đăng nhập không hợp lệ');
        return;
      }
      
      localStorage.setItem('accessToken', data.accessToken);
      
      loginStore(data.user);
      
      toast.success(data.message || 'Đăng nhập thành công');
      
      // Check user role and redirect accordingly
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'instructor' || data.user.isInstructorActive) {
          router.push('/instructor');
        } else {
          router.push('/');
        }
      }, 100);
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Register Hook
 * POST /auth/register
 */
export const useRegister = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: RegisterData) => wishzyAuthService.register(data),
    onSuccess: (data: RegisterResponse) => {
      toast.success(data.message || 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.');
      router.push('/auth/verify-email');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Verify Email Hook
 * GET /auth/verify-email?token=xxx
 */
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => wishzyAuthService.verifyEmail(token),
    onSuccess: (data: VerifyEmailResponse) => {
      toast.success(data.message || 'Email đã được xác thực thành công!');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Resend Verification Hook
 * POST /auth/resend-verification
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationData) => wishzyAuthService.resendVerification(data),
    onSuccess: (data: ResendVerificationResponse) => {
      toast.success(data.message || 'Email xác thực đã được gửi lại');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Forgot Password Hook
 * POST /auth/forgot-password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => wishzyAuthService.forgotPassword(data),
    onSuccess: (data: ForgotPasswordResponse) => {
      toast.success(data.message || 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Reset Password Hook
 * PUT /auth/reset-password?token=xxx
 */
export const useResetPassword = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) => 
      wishzyAuthService.resetPassword(token, data),
    onSuccess: (data: ResetPasswordResponse) => {
      toast.success(data.message || 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.');
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Get Profile Hook
 * GET /auth/profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => wishzyAuthService.getProfile(),
    enabled: !!localStorage.getItem('accessToken'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Logout Hook
 * POST /auth/logout
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAppStore();
  
  return useMutation({
    mutationFn: () => wishzyAuthService.logout(),
    onSuccess: (data: LogoutResponse) => {
      // Clear local storage
      localStorage.removeItem('accessToken');
      
      // Clear store
      logoutStore();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Show success message
      toast.success(data.message || 'Đăng xuất thành công');
      
      // Navigate to login
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('accessToken');
      logoutStore();
      queryClient.clear();
      
      const message = getErrorMessage(error);
      toast.success('Đăng xuất thành công');
      
      router.push('/auth/login');
    },
  });
};

/**
 * Refresh Token Hook
 * POST /auth/refresh-token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => wishzyAuthService.refreshToken(),
    onSuccess: (data: RefreshTokenResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
    },
    onError: () => {
      // If refresh fails, redirect to login
      localStorage.removeItem('accessToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    },
  });
};

/**
 * Check Authentication Status Hook
 */
export const useAuthStatus = () => {
  const { user, isAuthenticated } = useAppStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  return {
    user,
    isAuthenticated: isAuthenticated && !!token,
    token,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor' || user?.isInstructorActive,
    checkRole: (requiredRole: 'admin' | 'instructor' | 'user') => {
      if (!user) return false;
      if (requiredRole === 'admin') return user.role === 'admin';
      if (requiredRole === 'instructor') return user.role === 'instructor' || user.isInstructorActive;
      return true; // All authenticated users have at least 'user' role
    }
  };
};

/**
 * Auto Login Hook (for checking existing session)
 */
export const useAutoLogin = () => {
  const { login: loginStore } = useAppStore();
  const profileQuery = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  
  React.useEffect(() => {
    if (profileQuery.data && !profileQuery.isError) {
      loginStore(profileQuery.data);
      
      // Check user role and redirect if needed
      const user = profileQuery.data;
      const isAdmin = user.role === 'admin';
      const isInstructor = user.role === 'instructor' || user.isInstructorActive;
      
      // Only redirect if user is on the homepage or login page
      const isAuthPage = pathname === '/' || pathname?.includes('/auth/');
      
      if (isAuthPage) {
        if (isAdmin && !pathname?.includes('/admin')) {
          router.push('/admin');
        } else if (isInstructor && !pathname?.includes('/instructor')) {
          router.push('/instructor');
        }
      }
    }
  }, [profileQuery.data, profileQuery.isError, loginStore, router, pathname]);
  
  return profileQuery;
};

// Legacy compatibility exports
export { useLogin as useWishzyLogin };
export { useRegister as useWishzyRegister };
export { useVerifyEmail as useWishzyVerifyEmail };
export { useResendVerification as useWishzyResendVerification };
export { useForgotPassword as useWishzyForgotPassword };
export { useResetPassword as useWishzyResetPassword };
export { useProfile as useWishzyProfile };
export { useLogout as useWishzyLogout };
export { useRefreshToken as useWishzyRefreshToken };
