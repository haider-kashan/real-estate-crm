import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from './components/BottomNav';
import { ClerkProvider, Show } from '@clerk/nextjs';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} pb-0`}>
        <ClerkProvider>
          {children}
          <Show when="signed-in">
            <BottomNav />
          </Show>
        </ClerkProvider>
      </body>
    </html>
  );
}