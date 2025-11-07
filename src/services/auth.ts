import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  dob?: string | null;
  gender?: string | null;
  verified: boolean;
  isEmailVerified?: boolean;
  address?: string | null;
  avatar?: string | null;
  age?: number | null;
  phone?: string | null;
  loginType: string;
  role: string;
  isInstructorActive: boolean;
  passwordModified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message: string;
  statusCode?: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    
    if (response.data && response.data.data) {
      console.log('Using nested data:', response.data.data);
      return {
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        message: response.data.message
      };
    }
    
    return response.data;
  },

  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, data: ResetPasswordData): Promise<ApiResponse> {
    const response = await api.put(`/auth/reset-password?token=${token}`, data);
    return response.data;
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    console.log('getProfile response:', response.data);
    
    if (response.data && response.data.data) {
      console.log('Using nested user data:', response.data.data);
      return response.data.data;
    }
    
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
