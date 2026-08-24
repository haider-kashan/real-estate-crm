import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from './components/BottomNav';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EstatePulse | EstatePulse',
  description: 'Manage your property leads and pipelines.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <html lang="en">
      <body className={`${inter.className} pb-0`}>
        <ClerkProvider>
          {children}
          {userId && <BottomNav />}
        </ClerkProvider>
      </body>
    </html>
  );
}