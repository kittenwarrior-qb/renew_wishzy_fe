'use client';

import { Anchor, Button, Container, Group, Text, Avatar, Menu } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLogout } from '@/components/auth/useAuth';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { LocaleSwitcher } from '@/shared/common/LocaleSwitcher';
import { ThemeSwitcher } from '@/shared/common/ThemeSwitcher';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';

const Header = () => {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const [isHydrated, setIsHydrated] = useState(false);
  const { colorScheme } = useThemeStore();
  const pathname = usePathname();

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

  const normalizedPath = (pathname?.replace(/\/$/, '') || '');
  const _isHomeRoute = normalizedPath === ''
    || /^\/[a-z]{2}$/.test(normalizedPath);

  // Use subtle bottom shadow + hairline for separation in both themes
  const headerBorderClass = 'shadow-[0_1px_0_0_rgba(0,0,0,0.06),0_8px_16px_-14px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_0_0_rgba(0,0,0,0.35),0_8px_16px_-14px_rgba(0,0,0,0.6)]';

  return (
    <header className={`sticky top-0 z-101 h-[60px] bg-(--mantine-color-body) ${headerBorderClass}`}>
      <Container size="xl" className="h-full">
        <Group justify="space-between" h="100%">
          <Group gap="lg">
            <Anchor
              component={Link}
              href="/"
              fw={600}
              size="lg"
              className="inline-flex items-center no-underline"
              aria-label={t('RootLayout.home_link')}
            >
              <img
                src={colorScheme === 'dark' ? '/assets/images/white-logo.png' : '/assets/images/black-logo.png'}
                alt="Wishzy logo"
                className="h-7"
              />
            </Anchor>
          </Group>

          <Group gap="md">
            {isHydrated && isAuthenticated
              ? (
                  <Menu withinPortal position="bottom-end" shadow="sm" zIndex={2000}>
                    <Menu.Target>
                      <Avatar
                        radius="xl"
                        variant="filled"
                        color="brand"
                        className="cursor-pointer select-none"
                      >
                        {(user?.email?.[0] || '?').toUpperCase()}
                      </Avatar>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {user?.email && (
                        <Menu.Label>{user.email}</Menu.Label>
                      )}
                      <Menu.Item onClick={handleLogout} disabled={logoutMutation.isPending}>
                        {t('DashboardLayout.sign_out')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )
              : (
                  isHydrated && (
                    <Button variant="subtle" onClick={() => router.push('/sign-in')}>
                      {t('RootLayout.sign_in_link')}
                    </Button>
                  )
                )}
            <LocaleSwitcher />
            <ThemeSwitcher />
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
