import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google';
import { NotFoundAnimation } from '@/components/rive-animation/NotFoundAnimation';
import { routing } from '@/libs/I18nRouting';
import { MantineProvider } from '@/providers/MantineProvider';
import { AppConfig } from '@/utils/AppConfig';

const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });

export default async function RootNotFoundPage() {
  const t = await getTranslations({ locale: AppConfig.defaultLocale, namespace: 'NotFound' });
  const homeHref = `/${routing.defaultLocale}`;

  return (
    <MantineProvider>
      <div className={openSans.className} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <Container size="sm" py="xl" style={{ width: '100%' }}>
          <Paper shadow="sm" p="xl" radius="md" withBorder style={{ width: '100%' }}>
            <Stack gap="lg" align="center">
              <NotFoundAnimation height={500} />
              <Title order={2} ta="center">
                {t('title')}
              </Title>
              <Text size="lg" c="dimmed" ta="center">
                {t('description')}
              </Text>
              <Button component="a" href={homeHref} variant="light" size="md" className="mx-auto flex w-full justify-center">
                {t('back_home')}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </div>
    </MantineProvider>
  );
}
