'use client';

import type { LoginRequest } from '@/types/auth';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type LoginFormProps = {
  onSubmit: (values: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
};

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const t = useTranslations('SignIn');
  const tAuth = useTranslations('Auth');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginRequest>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) {
          return t('email_label') || 'Email is required';
        }
        return null;
      },
      password: (value) => {
        if (!value) {
          return t('password_label') || 'Password is required';
        }
        if (value.length < 1) {
          return 'Password must be at least 1 characters';
        }
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          placeholder={t('email_or_username_placeholder')}
          variant="filled"
          {...form.getInputProps('email')}
        />

        <TextInput
          type={showPassword ? 'text' : 'password'}
          placeholder={t('password_placeholder')}
          variant="filled"
          rightSectionWidth={60}
          rightSection={(
            <Button
              variant="subtle"
              size="xs"
              onClick={() => setShowPassword(!showPassword)}
              style={{ height: 'auto', padding: '4px 8px' }}
            >
              {showPassword ? tAuth('hide_password') : tAuth('show_password')}
            </Button>
          )}
          {...form.getInputProps('password')}
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: '1rem' }}
        >
          {t('sign_in_button')}
        </Button>

        {error && (
          <Text c="red" size="sm" ta="center">
            {error instanceof Error ? error.message : t('error_message')}
          </Text>
        )}
      </Stack>
    </form>
  );
}
