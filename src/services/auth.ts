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

// Wishzy Auth Service - Full Flow Implementation
export const wishzyAuthService = {
  /**
   * User Registration
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiRequest<RegisterResponse>('auth/register', {
      method: 'POST',
      data,
    });
    return response;
  },

  /**
   * Email Verification
   * GET /auth/verify-email?token=xxx
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await apiRequest<VerifyEmailResponse>('auth/verify-email', {
      method: 'GET',
      params: { token },
    });
    return response;
  },

  /**
   * Resend Verification Email
   * POST /auth/resend-verification
   */
  resendVerification: async (data: ResendVerificationData): Promise<ResendVerificationResponse> => {
    const response = await apiRequest<ResendVerificationResponse>('auth/resend-verification', {
      method: 'POST',
      data,
    });
    return response;
  },

  /**
   * User Login
   * POST /auth/login
   * Sets refresh token in httpOnly cookie automatically
   */
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
    
    // Transform response to expected format
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      message: response.message,
    };
  },

  /**
   * Forgot Password
   * POST /auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    const response = await apiRequest<ForgotPasswordResponse>('auth/forgot-password', {
      method: 'POST',
      data,
    });
    return response;
  },

  /**
   * Reset Password
   * PUT /auth/reset-password?token=xxx
   */
  resetPassword: async (token: string, data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    const response = await apiRequest<ResetPasswordResponse>('auth/reset-password', {
      method: 'PUT',
      data,
      params: { token },
    });
    return response;
  },

  /**
   * Refresh Access Token
   * POST /auth/refresh-token
   * Uses refresh token from httpOnly cookie
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiRequest<RefreshTokenResponse>('auth/refresh-token', {
      method: 'POST',
    });
    return response;
  },

  /**
   * Get User Profile
   * GET /auth/profile
   * Requires valid access token
   */
  getProfile: async (): Promise<User> => {
    const response = await apiRequest<ProfileResponse>('auth/profile', {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * Update User Profile
   * PUT /auth/profile
   * Requires valid access token
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiRequest<UpdateProfileResponse>('auth/profile', {
      method: 'PUT',
      data,
    });
    return response.data;
  },

  /**
   * User Logout
   * POST /auth/logout
   * Clears refresh token cookie
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiRequest<LogoutResponse>('auth/logout', {
      method: 'POST',
    });
    return response;
  },
};

// Legacy compatibility
export const authService = wishzyAuthService;
