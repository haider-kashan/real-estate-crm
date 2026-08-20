import { auth } from '../auth';
import { redirect } from 'next/navigation';
import LandingPage from './components/LandingPage';

export default async function Home() {
  const session = await auth();

  // If user is authenticated, redirect directly to the Dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  // Otherwise, render the Landing Page
  return <LandingPage />;
}