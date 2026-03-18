// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import prisma from '../lib/prisma'; 

export default async function AdminDashboard() {
  // 1. STRICT SECURITY
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL; // <--- ⚠️ CHANGE THIS TO YOUR LOGIN EMAIL ⚠️
  
  if (!session?.user || session.user.email !== adminEmail) {
    redirect('/');
  }

  // 2. TIME PERIODS FOR GROWTH TRACKING
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 3. FETCH EVERYTHING IN PARALLEL FOR SPEED
  const [
    totalUsers,
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    statusBreakdown,
    typeBreakdown,
    eventBreakdown
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['type'], _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ['eventName'], _count: { _all: true } })
  ]);

  // 4. CALCULATE GROWTH METRICS
  let leadGrowth = 0;
  if (leadsLastMonth > 0) {
    leadGrowth = ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100;
  } else if (leadsThisMonth > 0) {
    leadGrowth = 100; 
  }

  const isGrowing = leadGrowth >= 0;

  // 5. HELPER TO FORMAT BREAKDOWNS
  const getCount = (array: any[], key: string, val: string) => 
    array.find(item => item[key] === val)?._count?._all || 0;

  const closedLeads = getCount(statusBreakdown, 'status', 'closed');
  const deadLeads = getCount(statusBreakdown, 'status', 'dead');
  const winRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agency Pulse</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Internal Analytics • Restricted Access</p>
        </header>

        {/* SECTION 1: GROWTH & STAGNATION (MoM) */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Growth vs Stagnation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-4xl font-black text-gray-900">{totalUsers}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Win Rate</p>
              <p className="text-4xl font-black text-gray-900">{winRate}%</p>
              <p className="text-xs text-gray-400 mt-2">{closedLeads} won / {deadLeads} lost</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Leads This Month</p>
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

        {/* SECTION 2: TRACTION & BOTTLENECKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Traction by Department</h2>
            <div className="space-y-4">
              {['buyer', 'seller', 'tenant', 'landlord'].map(type => {
                const count = getCount(typeBreakdown, 'type', type);
                const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="capitalize text-gray-700">{type}s</span>
                      <span className="text-gray-900">{count} <span className="text-gray-400 font-normal">({percentage.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THE BOTTLENECK TRACKER IS BACK! */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Pipeline Bottlenecks</h2>
            <div className="space-y-4">
              {[
                { status: 'new', color: 'bg-indigo-500' },
                { status: 'contacted', color: 'bg-blue-400' },
                { status: 'interested', color: 'bg-yellow-400' },
                { status: 'negotiation', color: 'bg-orange-500' }
              ].map(item => {
                const count = getCount(statusBreakdown, 'status', item.status);
                const activeLeads = totalLeads - closedLeads - deadLeads;
                const percentage = activeLeads > 0 ? (count / activeLeads) * 100 : 0;
                
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="capitalize text-gray-700">{item.status}</span>
                      <span className="text-gray-900">{count} active</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* SECTION 3: PRODUCT SIGNALS (FEATURE USAGE) */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 mt-8">Product Signals & Engagement</h2>
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
                <p className="text-xs font-bold text-gray-600 uppercase mt-1">Reminders Set</p>
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
              💡 <span className="text-gray-600">Product Insight:</span> Tracking active user engagement across high-value features determines feature priority for future iterations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}