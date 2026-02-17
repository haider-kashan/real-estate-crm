import { auth } from '@/auth';
import prisma from '@/app/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm'; 

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect('/login');

  return <ProfileForm user={user} />;
}