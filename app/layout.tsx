import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from './components/BottomNav';
// REMOVE: import AddLead ... (We don't need global AddLead anymore, it's inside TopBar)

import { auth } from '@/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real Estate CRM',
  description: 'Simple Lead Manager',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.className} pb-0`}>
        {children}
        {session?.user && <BottomNav />}
      </body>
    </html>
  );
}