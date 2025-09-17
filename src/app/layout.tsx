import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MUIThemeProvider from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { LocalizedLayout } from '@/components/layout/LocalizedLayout';
import { RouteGuard } from '@/components/auth';
import { UnsavedChangesProvider } from '@/providers/UnsavedChangesProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "TeachSpark Platform",
  description: "Assistant-powered educational content creation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} antialiased`}>
        <PostHogProvider>
          <I18nProvider>
            <LocalizedLayout>
              <MUIThemeProvider>
                <AuthProvider>
                  <UnsavedChangesProvider>
                    <RouteGuard>
                      {children}
                    </RouteGuard>
                  </UnsavedChangesProvider>
                </AuthProvider>
              </MUIThemeProvider>
            </LocalizedLayout>
          </I18nProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
