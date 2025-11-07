import { notFound } from 'next/navigation';
import { TranslationProvider } from '@/providers/TranslationProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import Header from '@/components/shared/layout/Header';

const locales = ['vi', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    const [common, auth, courses] = await Promise.all([
      import(`../../../locales/${locale}/common.json`),
      import(`../../../locales/${locale}/auth.json`),
      import(`../../../locales/${locale}/courses.json`)
    ]);
    
    return {
      ...common.default,
      auth: auth.default,
      courses: courses.default
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    const [common, auth, courses] = await Promise.all([
      import(`../../../locales/vi/common.json`),
      import(`../../../locales/vi/auth.json`),
      import(`../../../locales/vi/courses.json`)
    ]);
    
    return {
      ...common.default,
      auth: auth.default,
      courses: courses.default
    };
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <TranslationProvider locale={locale} messages={messages}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors">
          <Header />
          {children}
        </div>
      </AuthProvider>
    </TranslationProvider>
  );
}
