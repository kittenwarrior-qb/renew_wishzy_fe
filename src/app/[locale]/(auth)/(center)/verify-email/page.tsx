import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage';
import Footer from '@/components/layout/footer';

type IVerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(props: IVerifyEmailPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'VerifyEmail',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function VerifyEmailPageRoute(props: IVerifyEmailPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(locale);

  const token = searchParams.token || '';

  return (
    <>
      <VerifyEmailPage token={token} />
      <Footer />
    </>
  );
}
