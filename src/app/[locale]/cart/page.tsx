import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Cart } from '@/components/cart/cart';

export type ICartPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ICartPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: `Giỏ hàng - ${t('meta_title')}`,
  };
}

export default async function CartPage(props: ICartPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <Cart />;
}
