import { apiRequest } from '@/hooks/useApi';
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
  ProfileResponse,
  UpdateProfileData,
  UpdateProfileResponse,
  LogoutResponse,
  User
} from '@/types/auth';

export const wishzyAuthService = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiRequest<RegisterResponse>('auth/register', {
      method: 'POST',
      data,
    });
    return response;
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await apiRequest<VerifyEmailResponse>('auth/verify-email', {
      method: 'GET',
      params: { token },
    });
    return response;
  },

  resendVerification: async (data: ResendVerificationData): Promise<ResendVerificationResponse> => {
    const response = await apiRequest<ResendVerificationResponse>('auth/resend-verification', {
      method: 'POST',
      data,
    });
    return response;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiRequest<{
      success: boolean;
      data: {
        user: User;
        accessToken: string;
      };
      message: string;
    }>('auth/login', {
      method: 'POST',
      data: credentials,
    });
    
    // Ensure user role is from API response, not hardcoded
    const user = response.data.user;
    if (!user.role) {
      console.warn('User role is missing from API response:', user);
    }
    
    // Transform response to expected format
    return {
      user: user,
      accessToken: response.data.accessToken,
      message: response.message,
    };
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    const response = await apiRequest<ForgotPasswordResponse>('auth/forgot-password', {
      method: 'POST',
      data,
    });
    return response;
  },

  resetPassword: async (token: string, data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    const response = await apiRequest<ResetPasswordResponse>('auth/reset-password', {
      method: 'PUT',
      data,
      params: { token },
    });
    return response;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiRequest<RefreshTokenResponse>('auth/refresh-token', {
      method: 'POST',
    });
    return response;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiRequest<ProfileResponse>('auth/profile', {
      method: 'GET',
    });
    
    // Ensure user role is from API response, not hardcoded
    const user = response.data;
    if (!user.role) {
      console.warn('User role is missing from API response:', user);
    }
    
    return user;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiRequest<UpdateProfileResponse>('/users/profile/me', {
      method: 'PATCH',
      data,
    });
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiRequest<LogoutResponse>('auth/logout', {
      method: 'POST',
    });
    return response;
  },
};

export const authService = wishzyAuthService;
