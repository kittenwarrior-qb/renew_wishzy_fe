import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CourseDetail } from '@/components/course/course-detail';

export type ICourseDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: ICourseDetailPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: t('meta_title'),
  };
}

export default async function CourseDetailPage(props: ICourseDetailPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  return <CourseDetail id={id} />;
}
