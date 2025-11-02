'use client';

import { Anchor, Button, Container, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { LocaleSwitcher } from '@/shared/common/LocaleSwitcher';

const Header = () => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <header style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', height: '60px' }}>
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
            <Button
              variant="subtle"
              onClick={() => router.push('/sign-in')}
            >
              {t('RootLayout.sign_in_link')}
            </Button>
            <Button
              onClick={() => router.push('/sign-up')}
            >
              {t('RootLayout.sign_up_link')}
            </Button>
            <LocaleSwitcher />
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
