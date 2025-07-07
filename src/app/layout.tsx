import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MUIThemeProvider from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';

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
        <MUIThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MUIThemeProvider>
      </body>
    </html>
  );
}
