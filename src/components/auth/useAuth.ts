import type * as AuthTypes from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { apiRequest, useApiMutation } from '@/hooks/useApi';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/useAuthStore';

const authEndpoints = {
  register: { url: 'auth/register', method: 'POST' as const },
  login: { url: 'auth/login', method: 'POST' as const },
  logout: { url: 'auth/logout', method: 'POST' as const },
  refreshToken: { url: 'auth/refresh-token', method: 'POST' as const },
  verifyEmail: { url: 'auth/verify-email', method: 'GET' as const },
  resendVerification: { url: 'auth/resend-verification', method: 'POST' as const },
  forgotPassword: { url: 'auth/forgot-password', method: 'POST' as const },
  resetPassword: { url: 'auth/reset-password', method: 'PUT' as const },
} as const;

const RESPONSE_MESSAGES: Record<string, Record<'en' | 'vi', string>> = {
  'Registration successful. Please check your email to verify your account.': {
    en: 'Registration successful. Please check your email to verify your account.',
    vi: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
  },
  'Email verified successfully. You can now login.': {
    en: 'Email verified successfully. You can now login.',
    vi: 'Xác minh email thành công. Bạn có thể đăng nhập ngay bây giờ.',
  },
  'Verification email sent successfully': {
    en: 'Verification email sent successfully',
    vi: 'Email xác minh đã được gửi thành công',
  },
  'Login successful': {
    en: 'Login successful',
    vi: 'Đăng nhập thành công',
  },
  'If the email exists, a password reset link has been sent.': {
    en: 'If the email exists, a password reset link has been sent.',
    vi: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.',
  },
  'Password reset successfully. You can now login with your new password.': {
    en: 'Password reset successfully. You can now login with your new password.',
    vi: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
  },
  'Logout successful': {
    en: 'Logout successful',
    vi: 'Đăng xuất thành công',
  },
};

const NOTIFICATION_TITLES: Record<string, Record<'en' | 'vi', string>> = {
  register: {
    en: 'Registration successful',
    vi: 'Đăng ký thành công',
  },
  registerError: {
    en: 'Registration failed',
    vi: 'Đăng ký thất bại',
  },
  login: {
    en: 'Login successful',
    vi: 'Đăng nhập thành công',
  },
  loginError: {
    en: 'Login failed',
    vi: 'Đăng nhập thất bại',
  },
  logout: {
    en: 'Logout successful',
    vi: 'Đăng xuất thành công',
  },
  logoutError: {
    en: 'Logout failed',
    vi: 'Đăng xuất thất bại',
  },
  verifyEmail: {
    en: 'Email verified successfully',
    vi: 'Xác minh email thành công',
  },
  verifyEmailError: {
    en: 'Email verification failed',
    vi: 'Xác minh email thất bại',
  },
  resendVerification: {
    en: 'Verification email sent successfully',
    vi: 'Gửi email xác minh thành công',
  },
  resendVerificationError: {
    en: 'Failed to send verification email',
    vi: 'Gửi email xác minh thất bại',
  },
  forgotPassword: {
    en: 'Password reset email sent',
    vi: 'Gửi email đặt lại mật khẩu',
  },
  forgotPasswordError: {
    en: 'Failed to send password reset email',
    vi: 'Gửi email đặt lại mật khẩu thất bại',
  },
  resetPassword: {
    en: 'Password reset successfully',
    vi: 'Đặt lại mật khẩu thành công',
  },
  resetPasswordError: {
    en: 'Password reset failed',
    vi: 'Đặt lại mật khẩu thất bại',
  },
};

const translateMessage = (message: string, locale: string): string => {
  const translations = RESPONSE_MESSAGES[message];
  if (!translations) {
    return message;
  }
  return translations[locale as 'en' | 'vi'] || translations.en || message;
};

const getNotificationTitle = (key: string, locale: string): string => {
  const titles = NOTIFICATION_TITLES[key];
  if (!titles) {
    return key;
  }
  return titles[locale as 'en' | 'vi'] || titles.en || key;
};

export const useAuth = () => {
  const { login: setAuth, logout: clearAuth } = useAuthStore();

  const useRegister = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.RegisterResponse, AuthTypes.RegisterRequest>(
      authEndpoints.register.url,
      authEndpoints.register.method,
      {
        onSuccess: (data) => {
          notifications.show({
            title: getNotificationTitle('register', locale),
            message: translateMessage(data.message, locale),
            color: 'green',
            autoClose: 5000,
          });
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('registerError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('registerError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useLogin = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.LoginResponse | any, AuthTypes.LoginRequest>(
      authEndpoints.login.url,
      authEndpoints.login.method,
      {
        onSuccess: (data) => {
          const user = data?.user || data?.data?.user || data?.payload?.user;
          const accessToken = data?.accessToken || data?.token || data?.data?.accessToken || data?.payload?.accessToken;
          if (user && accessToken) {
            setAuth(user, accessToken);
          } else {
            // Fallback: try refresh immediately if backend set cookie only
            // or at least keep notification while warning in console
            console.warn('Login success, but missing user/token shape:', data);
          }
          if (data.message) {
            notifications.show({
              title: getNotificationTitle('login', locale),
              message: translateMessage(data.message, locale),
              color: 'green',
              autoClose: 3000,
            });
          }
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('loginError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('loginError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useLogout = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.LogoutResponse, void>(
      authEndpoints.logout.url,
      authEndpoints.logout.method,
      {
        onSuccess: (data) => {
          clearAuth();
          const defaultMessage = locale === 'vi' ? 'Bạn đã đăng xuất thành công' : 'You have successfully signed out';
          notifications.show({
            title: getNotificationTitle('logout', locale),
            message: data.message ? translateMessage(data.message, locale) : defaultMessage,
            color: 'blue',
            autoClose: 3000,
          });
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('logoutError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('logoutError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useRefreshToken = () => {
    return useApiMutation<AuthTypes.RefreshTokenResponse, void>(
      authEndpoints.refreshToken.url,
      authEndpoints.refreshToken.method,
      {
        onSuccess: (data) => {
          const { user } = useAuthStore.getState();
          if (user) {
            setAuth(user, data.accessToken);
          }
        },
      },
    );
  };

  const useVerifyEmail = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.VerifyEmailResponse, AuthTypes.VerifyEmailRequest>(
      authEndpoints.verifyEmail.url,
      authEndpoints.verifyEmail.method,
      {
        queryParams: variables => ({ token: variables.token }),
        onSuccess: (data) => {
          notifications.show({
            title: getNotificationTitle('verifyEmail', locale),
            message: translateMessage(data.message, locale),
            color: 'green',
            autoClose: 5000,
          });
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('verifyEmailError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('verifyEmailError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useResendVerification = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.ResendVerificationResponse, AuthTypes.ResendVerificationRequest>(
      authEndpoints.resendVerification.url,
      authEndpoints.resendVerification.method,
      {
        onSuccess: (data) => {
          notifications.show({
            title: getNotificationTitle('resendVerification', locale),
            message: translateMessage(data.message, locale),
            color: 'green',
            autoClose: 5000,
          });
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('resendVerificationError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('resendVerificationError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useForgotPassword = () => {
    const locale = useLocale();
    const notifications = useNotifications();
    return useApiMutation<AuthTypes.ForgotPasswordResponse, AuthTypes.ForgotPasswordRequest>(
      authEndpoints.forgotPassword.url,
      authEndpoints.forgotPassword.method,
      {
        onSuccess: (data) => {
          notifications.show({
            title: getNotificationTitle('forgotPassword', locale),
            message: translateMessage(data.message, locale),
            color: 'blue',
            autoClose: 5000,
          });
        },
        onError: (error) => {
          notifications.show({
            title: getNotificationTitle('forgotPasswordError', locale),
            message: error instanceof Error ? error.message : getNotificationTitle('forgotPasswordError', locale),
            color: 'red',
            autoClose: 5000,
          });
        },
      },
    );
  };

  const useResetPassword = () => {
    const locale = useLocale();
    const notifications = useNotifications();

    return useMutation<
      AuthTypes.ResetPasswordResponse,
      Error,
      AuthTypes.ResetPasswordRequest & { token: string }
    >({
      mutationFn: async (variables: AuthTypes.ResetPasswordRequest & { token: string }) => {
        const { token, ...payload } = variables;
        return apiRequest<AuthTypes.ResetPasswordResponse>(authEndpoints.resetPassword.url, {
          method: authEndpoints.resetPassword.method,
          body: JSON.stringify(payload),
          queryParams: { token },
        });
      },
      onSuccess: (data) => {
        notifications.show({
          title: getNotificationTitle('resetPassword', locale),
          message: translateMessage(data.message, locale),
          color: 'green',
          autoClose: 5000,
        });
      },
      onError: (error) => {
        notifications.show({
          title: getNotificationTitle('resetPasswordError', locale),
          message: error instanceof Error ? error.message : getNotificationTitle('resetPasswordError', locale),
          color: 'red',
          autoClose: 5000,
        });
      },
    });
  };

  return {
    useRegister,
    useLogin,
    useLogout,
    useRefreshToken,
    useVerifyEmail,
    useResendVerification,
    useForgotPassword,
    useResetPassword,
  };
};

export const useRegister = () => useAuth().useRegister();
export const useLogin = () => useAuth().useLogin();
export const useLogout = () => useAuth().useLogout();
export const useRefreshToken = () => useAuth().useRefreshToken();
export const useVerifyEmail = () => useAuth().useVerifyEmail();
export const useResendVerification = () => useAuth().useResendVerification();
export const useForgotPassword = () => useAuth().useForgotPassword();
export const useResetPassword = () => useAuth().useResetPassword();
