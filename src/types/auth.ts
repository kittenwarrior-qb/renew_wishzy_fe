// Login Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  message: string;
}

// Register Types  
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface RegisterResponse {
  message: string;
}

// User Types
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

// Email Verification Types
export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

// Password Reset Types
export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Token Types
export interface RefreshTokenResponse {
  accessToken: string;
  message?: string;
}

// Profile Types
export interface ProfileResponse {
  data: User;
}

// Logout Types
export interface LogoutResponse {
  message: string;
}

// Legacy compatibility (deprecated)
export interface AuthResponse extends LoginResponse {}
export interface RegisterRequest extends RegisterData {}
