
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppClientProviders } from '@/components/providers/AppClientProviders';

export const metadata: Metadata = {
  title: 'Daily Scheduler',
  description: 'Track your habits with a customizable calendar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AppClientProviders>
          {children}
        </AppClientProviders>
      </body>
    </html>
  );
}
