'use client';

import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { Box, Container, Paper, Stack, Text } from '@mantine/core';
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
    <Box style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Mobile: Canvas on top, Form below */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flex: 1,
        }}
        hiddenFrom="md"
      >
        <Box
          bg="orange.2"
          style={{ width: '100%', minHeight: '300px', flexShrink: 0, minWidth: 0 }}
        >
          <LittleBoyAnimation
            width="100%"
            height="100%"
          />
        </Box>
        <Box
          style={{
            width: '100%',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <Container size="xs" style={{ width: '100%' }}>
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

      {/* Desktop: Canvas 60%, Form 40% side by side */}
      <Box
        style={{ display: 'flex', width: '100%', flex: 1 }}
        visibleFrom="md"
      >
        <Box
          bg="orange.2"
          style={{ width: '60%', flexShrink: 0, minWidth: 0 }}
        >
          <LittleBoyAnimation
            width="100%"
            height="100%"
          />
        </Box>
        <Box
          style={{
            width: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <Container size="xs" style={{ width: '100%' }}>
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
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <VerifyEmailUI
          email={registeredEmail}
          onBackToLogin={handleBackToLogin}
        />
      </Paper>
    );
  }

  if (view === 'forgot-password') {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <ForgotPasswordForm
          onSubmit={handleForgotPassword}
          onBackToLogin={handleBackToLogin}
          isLoading={forgotPasswordMutation.isPending}
          error={forgotPasswordMutation.error || null}
        />
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
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
    </Paper>
  );
}
