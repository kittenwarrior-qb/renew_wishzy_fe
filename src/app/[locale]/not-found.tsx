import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google';
import Footer from '@/components/layout/footer';
import { NotFoundAnimation } from '@/components/rive-animation/NotFoundAnimation';

const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });

export async function generateMetadata() {
  const t = await getTranslations('NotFound');
  return {
    title: t('title'),
  };
}

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound');

  return (
    <>
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
              <Button component="a" href="/" variant="light" size="md" className="flex justify-center mx-auto w-full">
                {t('back_home')}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </div>
      <Footer />
    </>
  );
}
