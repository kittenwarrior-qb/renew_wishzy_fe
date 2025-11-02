'use client';

import type { RegisterRequest } from '@/types/auth';
import { Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useRegister } from '@/shared/components/auth/useAuth';

export function SignUpForm() {
  const t = useTranslations('SignUp');
  const registerMutation = useRegister();

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
    try {
      await registerMutation.mutateAsync(values);
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('error_message');
      form.setFieldError('email', errorMessage);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Title order={1} ta="center">
            {t('meta_title')}
          </Title>
          <Text c="dimmed" ta="center" size="sm">
            {t('meta_description')}
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                required
                {...form.getInputProps('fullName')}
              />

              <TextInput
                label={t('email_label')}
                placeholder="your.email@example.com"
                type="email"
                required
                {...form.getInputProps('email')}
              />

              <TextInput
                label={t('password_label')}
                placeholder="••••••••"
                type="password"
                required
                {...form.getInputProps('password')}
              />

              <TextInput
                label="Confirm Password"
                placeholder="••••••••"
                type="password"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button
                type="submit"
                fullWidth
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
              >
                {t('sign_up_button')}
              </Button>

              {registerMutation.isError && (
                <Text c="red" size="sm" ta="center">
                  {registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : 'Registration failed. Please try again.'}
                </Text>
              )}

              {registerMutation.isSuccess && (
                <Text c="green" size="sm" ta="center">
                  Registration successful! Please check your email to verify your account.
                </Text>
              )}
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
