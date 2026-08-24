import { requireDbUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import HeaderBar from '@/app/components/HeaderBar';
import FollowUpsClient from './FollowUpsClient';

export default async function FollowUpsPage() {
  const dbUser = await requireDbUser();
  if (!dbUser) redirect('/login');

  // Fetch leads that need a follow up
  const pendingFollowUps = await prisma.lead.findMany({
    where: { 
      userId: dbUser.id,
      status: { notIn: ['closed', 'dead'] }, // Skip closed/dead deals
      followUp: {
        not: null
      }
    },
    orderBy: { followUp: 'asc' } // Show most overdue first
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-[100px] flex flex-col">
      <HeaderBar 
        user={{ name: dbUser.name || 'User', email: dbUser.email, logoUrl: dbUser.logoUrl }} 
        title="Tasks" 
      />
      
      <div className="px-4 py-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
           You have {pendingFollowUps.length} leads that require a follow-up call.
        </p>
      </div>

      <div className="flex-1 w-full px-4">
         <FollowUpsClient leads={pendingFollowUps} />
      </div>
    </div>
  );
}
