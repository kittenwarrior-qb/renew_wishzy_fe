'use client';

import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { Box, Container, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useForgotPassword, useLogin, useRegister } from '@/components/auth/useAuth';
import { LittleBoyAnimation } from '@/components/rive-animation/LittleBoyAnimation';
import { useRouter } from '@/libs/I18nNavigation';
import { AuthTabs } from './AuthTabs';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { GoogleLoginButton } from './GoogleLoginButton';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerifyEmailUI } from './VerifyEmailUI';

type ViewType = 'auth' | 'verify-email' | 'forgot-password';

export function AuthForm() {
  const router = useRouter();
  const pathname = usePathname();
  const defaultTab = pathname?.includes('/sign-up') ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab);
  const [view, setView] = useState<ViewType>('auth');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();

  const handleLogin = async (values: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push('/');
    } catch {
      // Error is handled by useLogin hook notification
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    try {
      await registerMutation.mutateAsync(values);
      setRegisteredEmail(values.email);
      setView('verify-email');
    } catch {
      // Error is handled by useRegister hook notification
    }
  };

  const handleForgotPassword = async (values: { email: string }) => {
    try {
      await forgotPasswordMutation.mutateAsync(values);
    } catch {
      // Error is handled by useForgotPassword hook notification
    }
  };

  const handleGoogleLogin = () => {
    console.warn('Google login not implemented yet');
  };

  const handleBackToLogin = () => {
    setView('auth');
    setActiveTab('login');
  };

  return (
    <Box className="flex min-h-screen flex-col">
      {/* Mobile: Canvas on top, Form below */}
      <Box className="flex w-full flex-1 flex-col md:hidden">
        <Box bg="orange.2" className="min-h-[300px] w-full min-w-0 shrink-0">
          <LittleBoyAnimation
            width="100%"
            height="100%"
          />
        </Box>
        <Box className="flex w-full flex-1 items-center justify-center p-4">
          <Container size="xs" className="w-full">
            <AuthFormContent
              view={view}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              registeredEmail={registeredEmail}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              handleForgotPassword={handleForgotPassword}
              handleGoogleLogin={handleGoogleLogin}
              handleBackToLogin={handleBackToLogin}
              loginMutation={loginMutation}
              registerMutation={registerMutation}
              forgotPasswordMutation={forgotPasswordMutation}
              setView={setView}
              setRegisteredEmail={setRegisteredEmail}
            />
          </Container>
        </Box>
      </Box>

      {/* Desktop: Canvas 50%, Form 50% side by side */}
      <Box className="hidden w-full flex-1 md:flex">
        <Box bg="orange.2" className="w-1/2 min-w-0 shrink-0">
          <LittleBoyAnimation
            width="100%"
            height="100%"
          />
        </Box>
        <Box className="flex w-1/2 items-center justify-center p-10">
          <Container size="sm" className="w-full max-w-[480px]">
            <AuthFormContent
              view={view}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              registeredEmail={registeredEmail}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              handleForgotPassword={handleForgotPassword}
              handleGoogleLogin={handleGoogleLogin}
              handleBackToLogin={handleBackToLogin}
              loginMutation={loginMutation}
              registerMutation={registerMutation}
              forgotPasswordMutation={forgotPasswordMutation}
              setView={setView}
              setRegisteredEmail={setRegisteredEmail}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

type AuthFormContentProps = {
  view: ViewType;
  activeTab: string | null;
  setActiveTab: (value: string | null) => void;
  registeredEmail: string;
  handleLogin: (values: LoginRequest) => Promise<void>;
  handleRegister: (values: RegisterRequest) => Promise<void>;
  handleForgotPassword: (values: { email: string }) => Promise<void>;
  handleGoogleLogin: () => void;
  handleBackToLogin: () => void;
  loginMutation: ReturnType<typeof useLogin>;
  registerMutation: ReturnType<typeof useRegister>;
  forgotPasswordMutation: ReturnType<typeof useForgotPassword>;
  setView: (view: ViewType) => void;
  setRegisteredEmail: (email: string) => void;
};

function AuthFormContent({
  view,
  activeTab,
  setActiveTab,
  registeredEmail,
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleGoogleLogin,
  handleBackToLogin,
  loginMutation,
  registerMutation,
  forgotPasswordMutation,
  setView,
  setRegisteredEmail,
}: AuthFormContentProps) {
  const tSignIn = useTranslations('SignIn');

  if (view === 'verify-email') {
    return (
      <VerifyEmailUI
        email={registeredEmail}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  if (view === 'forgot-password') {
    return (
      <ForgotPasswordForm
        onSubmit={handleForgotPassword}
        onBackToLogin={handleBackToLogin}
        isLoading={forgotPasswordMutation.isPending}
        error={forgotPasswordMutation.error || null}
      />
    );
  }

  return (
    <Stack gap="lg">
      <GoogleLoginButton onClick={handleGoogleLogin} />

      <AuthTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loginPanel={(
          <LoginForm
            onSubmit={handleLogin}
            isLoading={loginMutation.isPending}
            error={loginMutation.error || null}
          />
        )}
        signupPanel={(
          <RegisterForm
            onSubmit={handleRegister}
            onSuccess={(email) => {
              setRegisteredEmail(email);
              setView('verify-email');
            }}
            isLoading={registerMutation.isPending}
            error={registerMutation.error || null}
          />
        )}
      />

      <Text
        component="a"
        href="#"
        size="sm"
        ta="center"
        style={{ textDecoration: 'none', cursor: 'pointer' }}
        onClick={(e) => {
          e.preventDefault();
          setView('forgot-password');
        }}
      >
        {tSignIn('forgot_password')}
      </Text>
    </Stack>
  );
}
