import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
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
    <html lang="en">
      <body
        className={`${beVietnamPro.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <QueryProvider>
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            expand={true}
            duration={4000}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
