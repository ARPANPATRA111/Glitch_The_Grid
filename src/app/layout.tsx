import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'IIPS Smart Placement Portal',
    template: '%s | IIPS Placements',
  },
  description: 'Official Placement Portal for Institute of Information Processing & Science, DAVV Indore',
  keywords: ['IIPS', 'DAVV', 'Placements', 'Campus Recruitment', 'Jobs', 'MCA', 'MBA'],
  authors: [{ name: 'IIPS Placement Cell' }],
  creator: 'IIPS DAVV',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://placements.iips.edu.in',
    siteName: 'IIPS Smart Placement Portal',
    title: 'IIPS Smart Placement Portal',
    description: 'Official Placement Portal for IIPS, DAVV Indore',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
