import type { Metadata } from 'next';
import { Container, Paper } from '@mantine/core';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Footer from '@/components/layout/footer';

type IResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(props: IResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'ResetPassword',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ResetPasswordPage(props: IResetPasswordPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(locale);

  const token = searchParams.token || '';

  if (!token) {
    return (
      <>
        <Container size="xs" py="xl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
          <Paper shadow="sm" p="xl" radius="md" withBorder style={{ width: '100%' }}>
            <div>Invalid or missing token</div>
          </Paper>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Container size="xs" py="xl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <Paper shadow="sm" p="xl" radius="md" withBorder style={{ width: '100%' }}>
          <ResetPasswordForm token={token} />
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
