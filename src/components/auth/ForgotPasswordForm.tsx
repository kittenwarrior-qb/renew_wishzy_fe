'use client';

import type { ForgotPasswordRequest } from '@/types/auth';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordRequest) => Promise<void>;
  onBackToLogin: () => void;
  isLoading?: boolean;
  error?: Error | null;
};

export function ForgotPasswordForm({ onSubmit, onBackToLogin, isLoading, error }: ForgotPasswordFormProps) {
  const t = useTranslations('ForgotPassword');

  const form = useForm<ForgotPasswordRequest>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) {
          return 'Email is required';
        }
        return null;
      },
    },
  });

  return (
    <Stack gap="md">
      <Text size="xl" fw={700} ta="center">
        {t('title')}
      </Text>
      <Text size="sm" c="dimmed" ta="center">
        {t('description')}
      </Text>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            placeholder={t('email_placeholder')}
            type="email"
            variant="filled"
            {...form.getInputProps('email')}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            loading={isLoading}
            disabled={isLoading}
          >
            {t('send_button')}
          </Button>

          {error && (
            <Text c="red" size="sm" ta="center">
              {error instanceof Error ? error.message : t('error_message')}
            </Text>
          )}
        </Stack>
      </form>

      <Button
        variant="subtle"
        fullWidth
        onClick={onBackToLogin}
      >
        {t('back_to_login')}
      </Button>
    </Stack>
  );
}
