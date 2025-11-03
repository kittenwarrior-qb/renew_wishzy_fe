'use client';

import type { RegisterRequest } from '@/types/auth';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type RegisterFormProps = {
  onSubmit: (values: RegisterRequest) => Promise<void>;
  onSuccess: (email: string) => void;
  isLoading?: boolean;
  error?: Error | null;
};

export function RegisterForm({ onSubmit, onSuccess, isLoading, error }: RegisterFormProps) {
  const t = useTranslations('SignUp');
  const tAuth = useTranslations('Auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterRequest>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      fullName: (value) => {
        if (!value) {
          return 'Full name is required';
        }
        if (value.length < 1) {
          return 'Full name must be at least 1 characters';
        }
        return null;
      },
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

  const handleSubmit = async (values: RegisterRequest) => {
    await onSubmit(values);
    onSuccess(values.email);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          placeholder={t('full_name_placeholder')}
          variant="filled"
          {...form.getInputProps('fullName')}
        />

        <TextInput
          placeholder={t('email_label')}
          type="email"
          variant="filled"
          {...form.getInputProps('email')}
        />

        <TextInput
          type={showPassword ? 'text' : 'password'}
          placeholder={t('password_placeholder') || 'password'}
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
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: '1rem' }}
        >
          {t('sign_up_button')}
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
