'use client';

import type { VerifyEmailRequest } from '@/types/auth';
import { Box, Button, Container, Paper, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LittleBoyAnimation } from '@/components/rive-animation/LittleBoyAnimation';
import { OkAnimation } from '@/components/rive-animation/OkAnimation';
import { useRouter } from '@/libs/I18nNavigation';
import { useVerifyEmail } from './useAuth';

type VerifyEmailPageProps = {
  token: string;
};

export function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  const t = useTranslations('VerifyEmail');
  const router = useRouter();
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token && !verifyMutation.isPending && !verifyMutation.isSuccess && !verifyMutation.isError) {
      const verifyRequest: VerifyEmailRequest = { token };
      verifyMutation.mutate(verifyRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleBackToLogin = () => {
    router.push('/sign-in');
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
            <VerifyEmailContent
              token={token}
              verifyMutation={verifyMutation}
              onBackToLogin={handleBackToLogin}
              t={t}
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
            <VerifyEmailContent
              token={token}
              verifyMutation={verifyMutation}
              onBackToLogin={handleBackToLogin}
              t={t}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

type VerifyEmailContentProps = {
  token: string;
  verifyMutation: ReturnType<typeof useVerifyEmail>;
  onBackToLogin: () => void;
  t: ReturnType<typeof useTranslations<'VerifyEmail'>>;
};

function VerifyEmailContent({
  token,
  verifyMutation,
  onBackToLogin,
  t,
}: VerifyEmailContentProps) {
  if (!token) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="md" align="center">
          <Text size="xl" fw={700} ta="center" c="red">
            {t('verify_error')}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Invalid or missing verification token.
          </Text>
          <Button
            variant="light"
            fullWidth
            onClick={onBackToLogin}
          >
            {t('back_to_login')}
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="md" align="center">
          <Text size="xl" fw={700} ta="center">
            {t('title')}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Verifying your email...
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (verifyMutation.isError) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="md" align="center">
          <Text size="xl" fw={700} ta="center" c="red">
            {t('verify_error')}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {verifyMutation.error instanceof Error
              ? verifyMutation.error.message
              : t('verify_error')}
          </Text>
          <Button
            variant="light"
            fullWidth
            onClick={onBackToLogin}
          >
            {t('back_to_login')}
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="md" align="center">
          <OkAnimation height={150} />

          <Text size="xl" fw={700} ta="center" c="green">
            {t('verify_success')}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {t('verify_success')}
          </Text>
          <Button
            variant="light"
            fullWidth
            onClick={onBackToLogin}
          >
            {t('back_to_login')}
          </Button>
        </Stack>
      </Paper>
    );
  }

  return null;
}
