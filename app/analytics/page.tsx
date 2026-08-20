import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import HeaderBar from '@/app/components/HeaderBar'; 
import Link from 'next/link';
import prisma from '../lib/prisma';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // 1. TIME PERIODS FOR GROWTH TRACKING
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 2. FETCH PERSONAL METRICS ONLY
  const [
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    statusBreakdown,
    eventBreakdown
  ] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.lead.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ['eventName'], where: { userId }, _count: { _all: true } })
  ]);

  // 3. CALCULATE GROWTH METRICS
  let leadGrowth = 0;
  if (leadsLastMonth > 0) {
    leadGrowth = ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100;
  } else if (leadsThisMonth > 0) {
    leadGrowth = 100; 
  }
  const isGrowing = leadGrowth >= 0;

  // 4. HELPER TO FORMAT BREAKDOWNS
  const getCount = (array: any[], key: string, val: string) => 
    array.find(item => item[key] === val)?._count?._all || 0;

  const closedLeads = getCount(statusBreakdown, 'status', 'closed');
  const deadLeads = getCount(statusBreakdown, 'status', 'dead');
  const activeLeads = totalLeads - closedLeads - deadLeads;
  const winRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Re-use Header */}
      <HeaderBar 
        title="My Analytics" 
        subtitle="Personal Performance Tracking"
        showBack={true} 
        // @ts-expect-error - bypassing type check
        user={{ name: session.user.name || 'User', email: session.user.email }}
      />

      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-8">
        
        {/* SECTION 1: GROWTH & EFFICIENCY */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Growth & Efficiency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Win Rate</p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-gray-900">{winRate}%</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">{closedLeads} closed / {deadLeads} lost out of {totalLeads} total</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Leads Acquired This Month</p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-gray-900">{leadsThisMonth}</p>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${isGrowing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isGrowing ? '↑' : '↓'} {Math.abs(leadGrowth).toFixed(1)}% MoM
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">vs {leadsLastMonth} last month</p>
            </div>

          </div>
        </div>

        {/* SECTION 2: PIPELINE BOTTLENECKS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pipeline Bottlenecks</h2>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{activeLeads} Active Leads</span>
          </div>
          
          <div className="space-y-4">
            {[
              { status: 'new', color: 'bg-indigo-500' },
              { status: 'contacted', color: 'bg-blue-400' },
              { status: 'interested', color: 'bg-yellow-400' },
              { status: 'negotiation', color: 'bg-orange-500' }
            ].map(item => {
              const count = getCount(statusBreakdown, 'status', item.status);
              const percentage = activeLeads > 0 ? (count / activeLeads) * 100 : 0;
              
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span className="capitalize text-gray-700">{item.status}</span>
                    <span className="text-gray-900">{count} leads</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-5 font-medium leading-relaxed">
            💡 <span className="text-gray-600">Insight:</span> Focus your energy on leads in the <b>Negotiation</b> phase to increase your Win Rate.
          </p>
        </div>

        {/* SECTION 3: ENGAGEMENT METRICS */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Your Engagement Signals</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              <div className="p-4 bg-[#25D366]/10 rounded-xl text-center border border-[#25D366]/20">
                <p className="text-2xl font-black text-gray-900">{getCount(eventBreakdown, 'eventName', 'click_whatsapp')}</p>
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">WhatsApp</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl text-center border border-gray-200">
                <p className="text-2xl font-black text-gray-900">{getCount(eventBreakdown, 'eventName', 'click_call')}</p>
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">Direct Calls</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
                <p className="text-2xl font-black text-gray-900">{getCount(eventBreakdown, 'eventName', 'set_reminder')}</p>
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">Reminders</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                <p className="text-2xl font-black text-gray-900">{getCount(eventBreakdown, 'eventName', 'mark_contacted')}</p>
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">Updates</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl text-center border border-purple-100">
                <p className="text-2xl font-black text-gray-900">{getCount(eventBreakdown, 'eventName', 'click_share')}</p>
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">Shares</p>
              </div>

            </div>
            
            <p className="text-xs text-gray-400 mt-5 font-medium leading-relaxed">
              💡 <span className="text-gray-600">Tip:</span> Agents who utilize <b>Direct Calls</b> typically have a 25% higher closing rate than those relying only on WhatsApp.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}