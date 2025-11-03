'use client';

import type { ResetPasswordRequest } from '@/types/auth';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { OkAnimation } from '@/components/rive-animation/OkAnimation';
import { useRouter } from '@/libs/I18nNavigation';
import { useResetPassword } from './useAuth';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('ResetPassword');
  const tAuth = useTranslations('Auth');
  const router = useRouter();
  const resetMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordRequest>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => {
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 1) {
          return 'Password must be at least 1 characters';
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) {
          return 'Please confirm your password';
        }
        if (value !== values.password) {
          return 'Passwords do not match';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: ResetPasswordRequest) => {
    await resetMutation.mutateAsync({ ...values, token });
    // Do not redirect immediately; show success UI below
  };

  if (resetMutation.isSuccess) {
    return (
      <Stack gap="md" align="center">
        <OkAnimation height={180} />
        <Text size="xl" fw={700} ta="center" c="green">
          {t('success_message')}
        </Text>
        <Button variant="light" fullWidth onClick={() => router.push('/sign-in')}>
          {t('back_to_login')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text size="xl" fw={700} ta="center">
        {t('title')}
      </Text>
      <Text size="sm" c="dimmed" ta="center">
        {t('description')}
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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

          <TextInput
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('confirm_password_placeholder')}
            variant="filled"
            rightSectionWidth={60}
            rightSection={(
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ height: 'auto', padding: '4px 8px' }}
              >
                {showConfirmPassword ? tAuth('hide_password') : tAuth('show_password')}
              </Button>
            )}
            {...form.getInputProps('confirmPassword')}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            loading={resetMutation.isPending}
            disabled={resetMutation.isPending}
          >
            {t('reset_button')}
          </Button>

          {resetMutation.isError && (
            <Text c="red" size="sm" ta="center">
              {resetMutation.error instanceof Error ? resetMutation.error.message : t('error_message')}
            </Text>
          )}
        </Stack>
      </form>
    </Stack>
  );
}
