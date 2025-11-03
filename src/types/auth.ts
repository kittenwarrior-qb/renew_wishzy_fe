export type User = {
  id: string;
  email: string;
  fullName: string;
  verified: boolean;
  role?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type BaseResponse = {
  message: string;
};

type TokenRequest = {
  token: string;
};

type EmailRequest = {
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type VerifyEmailRequest = TokenRequest;
export type ResendVerificationRequest = EmailRequest;
export type ForgotPasswordRequest = EmailRequest;

export type ResetPasswordRequest = {
  password: string;
  confirmPassword: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  message?: string;
};

export type RegisterResponse = BaseResponse;
export type VerifyEmailResponse = BaseResponse;
export type ResendVerificationResponse = BaseResponse;
export type ForgotPasswordResponse = BaseResponse;
export type ResetPasswordResponse = BaseResponse;
export type LogoutResponse = BaseResponse;

export type RefreshTokenResponse = {
  accessToken: string;
};
