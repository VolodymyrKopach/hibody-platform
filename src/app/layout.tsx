import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MUIThemeProvider from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { LocalizedLayout } from '@/components/layout/LocalizedLayout';
import { RouteGuard } from '@/components/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "HiBody Platform",
  description: "AI-powered educational content creation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} antialiased`}>
        <I18nProvider>
          <LocalizedLayout>
            <MUIThemeProvider>
              <AuthProvider>
                <RouteGuard>
                  {children}
                </RouteGuard>
              </AuthProvider>
            </MUIThemeProvider>
          </LocalizedLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
