import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from './components/BottomNav';
// REMOVE: import AddLead ... (We don't need global AddLead anymore, it's inside TopBar)

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real Estate CRM',
  description: 'Simple Lead Manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} pb-0`}> {/* Remove pb-24 here if BottomNav handles it, or keep it if needed */}
        {children}
        <BottomNav />
        {/* REMOVE: <AddLead /> */}
      </body>
    </html>
  );
}