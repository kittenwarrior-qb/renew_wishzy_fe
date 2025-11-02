'use client';

import type { LoginRequest } from '@/types/auth';
import { Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';
import { useLogin } from '@/shared/components/auth/useAuth';

export function SignInForm() {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const loginMutation = useLogin();

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

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push('/');
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

              <Button
                type="submit"
                fullWidth
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                {t('sign_in_button')}
              </Button>

              {loginMutation.isError && (
                <Text c="red" size="sm" ta="center">
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : 'Login failed. Please try again.'}
                </Text>
              )}
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
