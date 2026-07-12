import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import HeaderBar from '@/app/components/HeaderBar';
import PipelineClient from './PipelineClient';

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  // Fetch all active leads for the Kanban board
  const leads = await prisma.lead.findMany({
    where: { 
      userId: session.user.id,
      // We exclude 'dead' if we want a clean pipeline
      status: { not: 'dead' }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-[100px] flex flex-col overflow-hidden">
      <HeaderBar user={session.user as any} title="Pipeline" />
      
      <div className="px-4 py-4 shrink-0">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Drag and drop leads vertically to update status.</p>
      </div>

      {/* The Kanban Board Client Component */}
      <div className="flex-1 w-full relative overflow-hidden">
         <PipelineClient initialLeads={leads} />
      </div>
    </div>
  );
}
