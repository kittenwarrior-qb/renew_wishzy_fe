import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from "@/providers/GoogleOAuthProvider";
import Header from "@/components/shared/layout/Header";
import Footer from "@/components/shared/layout/Footer";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { MaintenanceGuard } from "@/components/shared/layout/MaintenanceGuard";
import { Toaster } from "sonner";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wishzy - Learning Management System",
  description: "Elevate your learning experience with our modern, interactive learning management system. Access high-quality courses anytime, anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('user-storage');
                if (stored) {
                  const { state } = JSON.parse(stored);
                  if (state?.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${beVietnamPro.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          <QueryProvider>
            <GoogleOAuthProvider>
              <AuthProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <MaintenanceGuard>{children}</MaintenanceGuard>
                  </main>
                  <Footer />
                </div>
                <ScrollToTop />
              </AuthProvider>
            </GoogleOAuthProvider>
            <Toaster
              position="top-center"
              richColors
              expand={true}
              duration={4000}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
