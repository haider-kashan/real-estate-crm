import { getLeads } from '../../actions';
import MatchesClient from './MatchesClient';
import { requireDbUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Smart Matches | EstatePulse',
  description: 'View algorithmic deal matches',
};

export default async function MatchesPage() {
  const dbUser = await requireDbUser();
  if (!dbUser) redirect('/login');

  const allLeads = await getLeads();

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Smart Matches</h1>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">Opportunity Hub</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <MatchesClient leads={allLeads} />
      </div>
    </main>
  );
}
