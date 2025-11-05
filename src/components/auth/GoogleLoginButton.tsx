'use client';

import { Button, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

type GoogleLoginButtonProps = {
  onClick: () => void;
};

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  const t = useTranslations('Auth');

  return (
    <Stack gap="xs">
      <Text size="sm" c="dimmed" ta="center">
        {t('express_login_via_google')}
      </Text>
      <Button
        variant="light"
        fullWidth
        onClick={onClick}
        style={{
          justifyContent: 'space-between',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        <Text>Google</Text>
      </Button>
    </Stack>
  );
}
