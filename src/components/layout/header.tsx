'use client';

import { Anchor, Button, Container, Group, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useLogout } from '@/components/auth/useAuth';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { LocaleSwitcher } from '@/shared/common/LocaleSwitcher';
import { useAuthStore } from '@/stores/useAuthStore';

const Header = () => {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/');
    } catch {
      // Error is handled by useLogout hook notification
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        height: '60px',
      }}
    >
      <Container size="xl" style={{ height: '100%' }}>
        <Group justify="space-between" h="100%">
          <Group gap="lg">
            <Anchor
              component={Link}
              href="/"
              fw={600}
              size="lg"
              style={{ textDecoration: 'none' }}
            >
              {t('RootLayout.home_link')}
            </Anchor>
          </Group>

          <Group gap="md">
            {isHydrated && isAuthenticated
              ? (
                  <>
                    <Text size="sm" c="dimmed">
                      {user?.email}
                    </Text>
                    <Button
                      variant="subtle"
                      onClick={handleLogout}
                      loading={logoutMutation.isPending}
                    >
                      {t('DashboardLayout.sign_out')}
                    </Button>
                  </>
                )
              : (
                  isHydrated && (
                    <Button variant="subtle" onClick={() => router.push('/sign-in')}>
                      {t('RootLayout.sign_in_link')}
                    </Button>
                  )
                )}
            <LocaleSwitcher />
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
