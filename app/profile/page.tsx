import { requireDbUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm'; 

export default async function ProfilePage() {
  const dbUser = await requireDbUser();
  if (!dbUser) redirect('/login');

  return <ProfileForm user={dbUser} />;
}