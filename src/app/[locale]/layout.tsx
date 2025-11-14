import { notFound } from "next/navigation";
import { TranslationProvider } from "@/providers/TranslationProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from "@/providers/GoogleOAuthProvider";
import Header from "@/components/shared/layout/Header";
import Footer from "@/components/shared/layout/Footer";
import ScrollToTop from "@/components/shared/ScrollToTop";

const locales = ["vi", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    const [common, auth, courses, navigation] = await Promise.all([
      import(`../../../locales/${locale}/common.json`),
      import(`../../../locales/${locale}/auth.json`),
      import(`../../../locales/${locale}/courses.json`),
      import(`../../../locales/${locale}/navigation.json`),
    ]);

    return {
      ...common.default,
      auth: auth.default,
      courses: courses.default,
      navigation: navigation.default,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    const [common, auth, courses, navigation] = await Promise.all([
      import(`../../../locales/vi/common.json`),
      import(`../../../locales/vi/auth.json`),
      import(`../../../locales/vi/courses.json`),
      import(`../../../locales/vi/navigation.json`),
    ]);

    return {
      ...common.default,
      auth: auth.default,
      courses: courses.default,
      navigation: navigation.default,
    };
  }
}

export default async function LocaleLayout({
  children,
  params,
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
    <GoogleOAuthProvider>
      <TranslationProvider locale={locale} messages={messages}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
          </div>
        </AuthProvider>
      </TranslationProvider>
    </GoogleOAuthProvider>
  );
}
