'use client';

import { Box, Button, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useResendVerification } from './useAuth';

type VerifyEmailUIProps = {
  email: string;
  onBackToLogin: () => void;
};

export function VerifyEmailUI({ email, onBackToLogin }: VerifyEmailUIProps) {
  const t = useTranslations('VerifyEmail');
  const resendMutation = useResendVerification();

  const handleResend = async () => {
    await resendMutation.mutateAsync({ email });
  };

  return (
    <Box>
      <Stack gap="md" align="center">
        <Text size="xl" fw={700} ta="center">
          {t('title')}
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          {t('description')}
        </Text>
        <Text size="sm" fw={500} ta="center">
          {email}
        </Text>

        <Stack gap="sm" mt="md" style={{ width: '100%' }}>
          <Button
            variant="light"
            fullWidth
            onClick={handleResend}
            loading={resendMutation.isPending}
            disabled={resendMutation.isPending}
          >
            {t('resend_button')}
          </Button>
          <Button
            variant="subtle"
            fullWidth
            onClick={onBackToLogin}
          >
            {t('back_to_login')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
