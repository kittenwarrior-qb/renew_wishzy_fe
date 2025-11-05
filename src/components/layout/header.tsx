'use client';

import { Anchor, Avatar, Badge, Box, Button, Container, Group, Image, Menu, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLogout } from '@/components/auth/useAuth';
import { MiniCart } from '@/components/cart/mini-cart';
import { useCategoryList } from '@/components/category/useCategory';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { ThemeSwitcher } from '@/shared/common/ThemeSwitcher';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useThemeStore } from '@/stores/useThemeStore';

function ExploreDropdown() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);

  // 获取所有 parent categories
  const categoriesQuery = useCategoryList({ isSubCategory: false, limit: 50 });
  const categories = categoriesQuery.data?.data?.items ?? [];

  const handleDropdownMouseEnter = useCallback(() => {
    setIsOpen(true);
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    hoverTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      hoverTimerRef.current = null;
    }, 200);
  }, []);

  if (categoriesQuery.isLoading) {
    return null;
  }

  return (
    <Box
      ref={dropdownRef}
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
      style={{ position: 'relative' }}
    >
      <Button
        variant="subtle"
        size="md"
        fw={400}
        style={{
          color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
        }}
      >
        Khám phá
      </Button>
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
            borderRadius: '8px',
            boxShadow: isDark
              ? '0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '280px',
            maxWidth: '400px',
            padding: '12px 0',
            zIndex: 2000,
          }}
        >
          <Stack gap={0}>
            {categories.length === 0
              ? (
                  <Text
                    size="sm"
                    c="dimmed"
                    style={{ padding: '12px 16px' }}
                  >
                    Không có danh mục
                  </Text>
                )
              : (
                  categories.map(category => (
                    <Box
                      key={category.id}
                      component={Link}
                      href={`/courses?categoryId=${category.id}`}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'block',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'var(--mantine-color-gray-0)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Text
                        fw={400}
                        size="sm"
                        style={{
                          color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                        }}
                      >
                        {category.name}
                      </Text>
                    </Box>
                  ))
                )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function CartIcon() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { getItemCount } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const itemCount = getItemCount();

  const handleMouseEnter = useCallback(() => {
    setIsOpen(true);
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      hoverTimerRef.current = null;
    }, 200);
  }, []);

  return (
    <Box
      ref={cartRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <Box
        component="button"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
        }}
      >
        <IconShoppingCart size={24} />
        {itemCount > 0 && (
          <Badge
            size="xs"
            color="red"
            variant="filled"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: '18px',
              height: '18px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Box>
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            zIndex: 2000,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <MiniCart />
        </Box>
      )}
    </Box>
  );
}

const Header = () => {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const [isHydrated, setIsHydrated] = useState(false);
  const { colorScheme } = useThemeStore();

  useEffect(() => {
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
    }
  };

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
              <Image
                src={colorScheme === 'dark' ? '/assets/images/white-logo.png' : '/assets/images/black-logo.png'}
                alt="Wishzy logo"
                h={28}
                fit="contain"
              />
            </Anchor>
            <ExploreDropdown />
          </Group>

          <Group gap="md">
            <CartIcon />
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
                      <Menu.Item component={Link} href="/profile">
                        Hồ sơ
                      </Menu.Item>
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
            {/* <LocaleSwitcher /> */}
            <ThemeSwitcher />
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
