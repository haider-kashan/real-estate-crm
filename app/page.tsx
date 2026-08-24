import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from './components/LandingPage';

export default async function Home() {
  const { userId } = await auth();

  // If user is authenticated, redirect directly to the Dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // Otherwise, render the Landing Page
  return <LandingPage />;
}