'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderBar, { ReminderItem } from './HeaderBar';
import AddLeadModal from './AddLead';
import { parsePrice, getLeadHealth, formatIndianNumber, numberToWordsIndian, findLeadMatches } from '../lib/utils';
import { loadMoreLeads } from '../actions';

interface LeadDashboardProps {
  title: string;
  initialData: any[];
  department: 'sales' | 'rentals' | 'all';
  tabs?: { id: string; label: string }[];
  reminders?: ReminderItem[];
  user?: { name: string; email: string; logoUrl?: string | null; isDemo?: boolean }; // <--- 1. Added User Prop
}

export default function LeadDashboard({ 
  title, 
  initialData, 
  department, 
  tabs,
  user // <--- 2. Destructure User Prop
}: LeadDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get('adding') === 'true';
  const [currentLeads, setCurrentLeads] = useState(initialData); 
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].id : 'all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', propertyType: '' });
  const [sortBy, setSortBy] = useState('newest');

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextLeads = await loadMoreLeads(offset);
    
    if (nextLeads.length < 20) {
      setHasMore(false); // No more leads to load after this
    }
    
    setCurrentLeads((prev) => [...prev, ...nextLeads]);
    setOffset((prev) => prev + 20);
    setIsLoadingMore(false);
  };

  const theme = department === 'sales' ? 'blue' : (department === 'rentals' ? 'indigo' : 'white');
  const accentText = department === 'sales' ? 'text-blue-600' : (department === 'rentals' ? 'text-indigo-600' : 'text-gray-900');
  const accentBorder = department === 'sales' ? 'border-blue-600' : (department === 'rentals' ? 'border-indigo-600' : 'border-gray-900');
  const activeChipBg = department === 'sales' ? 'bg-blue-600' : (department === 'rentals' ? 'bg-indigo-600' : 'bg-gray-900');
  const statuses = ['all', 'new', 'contacted', 'interested', 'negotiation', 'closed', 'dead'];
  const [offset, setOffset] = useState(20);
  const [hasMore, setHasMore] = useState(initialData.length >= 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setCurrentLeads(initialData);
    setOffset(10);
    setHasMore(initialData.length >= 20);
  }, [initialData]);


  // --- 0. DATA TRANSLATION LAYER (Database -> UI) ---
  const processedData = useMemo(() => {
    return currentLeads.map((lead) => ({
      ...lead,
      dateAdded: lead.createdAt || lead.dateAdded,
      lastContactDate: lead.lastContacted || lead.lastContactDate,
      id: lead.id, 
    }));
  }, [currentLeads]);

  // --- 1. ACTION CENTER LOGIC ---
  const urgentLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    // @ts-ignore
    return processedData.filter(l => {
      const status = (l.status || '').toLowerCase();
      if (status === 'dead' || status === 'closed') {
        return false;
      }

      let isReminderDue = false;
      if (l.followUp) {
        const date = new Date(l.followUp);
        isReminderDue = date < now || date.toDateString() === todayStr;
      }

      // @ts-ignore
      const health = getLeadHealth(l.lastContactDate, l.dateAdded);
      const isCritical = health.status === 'Critical';

      return isReminderDue || isCritical;
    }).sort((a, b) => {
       if (a.followUp && !b.followUp) return -1;
       return 0;
    });
  }, [processedData]);

  const headerReminders = urgentLeads.map(l => {
      const now = new Date();
      // @ts-ignore
      const health = getLeadHealth(l.lastContactDate, l.dateAdded);
      
      let type: 'overdue' | 'today' | 'critical' | null = null;
      
      if (health.status === 'Critical') {
        type = 'critical';
      } else if (l.followUp) {
        const fDate = new Date(l.followUp);
        const isToday = fDate.toDateString() === now.toDateString();
        type = isToday ? 'today' : 'overdue';
      }

      if (!type) return null;

      return {
          id: l.id,
          name: l.name,
          phone: l.phone,
          date: l.followUp,
          type: type,
          daysAgo: health.days
      }
  }).filter(Boolean) as ReminderItem[];

  // --- FILTER ENGINE ---
  const filteredLeads = useMemo(() => {
    let result = processedData;
    if (activeTab !== 'all') result = result.filter(l => l.type === activeTab);
    if (activeStatus !== 'all') result = result.filter(l => l.status === activeStatus);
    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter(l => l.location?.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
    }
    if (filters.propertyType) result = result.filter(l => l.propertyType === filters.propertyType);
    // @ts-ignore
    if (filters.minPrice) result = result.filter(l => parsePrice(l.budget || l.demand) >= parseFloat(filters.minPrice));
    // @ts-ignore
    if (filters.maxPrice) result = result.filter(l => parsePrice(l.budget || l.demand) <= parseFloat(filters.maxPrice));
    
    if (sortBy === 'price_asc') { /* @ts-ignore */ result.sort((a, b) => parsePrice(a.budget || a.demand) - parsePrice(b.budget || b.demand)); }
    else if (sortBy === 'price_desc') { /* @ts-ignore */ result.sort((a, b) => parsePrice(b.budget || b.demand) - parsePrice(a.budget || a.demand)); }
    else { result.sort((a, b) => b.id - a.id); }
    return result;
  }, [filters, sortBy, activeTab, activeStatus, processedData]);

  // Helper function to return dynamic styling for lead types
  const getTypeBadgeStyles = (type: string) => {
    const normalizedType = (type || '').toLowerCase();
    switch (normalizedType) {
      case 'buyer':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'seller':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'tenant':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'landlord':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <HeaderBar 
          title={title} 
          subtitle={`${filteredLeads.length} Leads`} 
          theme={theme} 
          reminders={headerReminders} 
          showBack={department !== 'all'} 
          user={user} // <--- 3. Passed User to HeaderBar
          onFilterChange={setFilters} 
          onSortChange={setSortBy} 
          onAddClick={() => router.push(pathname + '?adding=true')} 
        />
        
        {tabs && (
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('all')} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'all' ? `${accentText} ${accentBorder}` : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>All</button>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? `${accentText} ${accentBorder}` : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>{tab.label}</button>
            ))}
          </div>
        )}
        <div className="py-3 pl-3 border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2 pr-4">
            {statuses.map((status) => (
              <button key={status} onClick={() => setActiveStatus(status)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all active:scale-95 ${activeStatus === status ? `${activeChipBg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{status}</button>
            ))}
          </div>
        </div>
      </div>

      <AddLeadModal isOpen={isModalOpen} onClose={() => router.back()} department={department} />



      <div className="p-3 space-y-3 flex-1 pb-32">
        {/* --- MAIN LIST --- */}
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-8 pb-12 px-6 mt-4 text-center bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Welcome to your Pipeline</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-[250px]">Here is how to close your first deal in 3 simple steps:</p>
            
            <div className="space-y-4 w-full max-w-[280px] text-left">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</div>
                  <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="font-bold text-sm text-gray-900">Add a Lead</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tap the + button to add your first buyer, seller, tenant or landlord.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">2</div>
                  <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="font-bold text-sm text-gray-900">Get AI Matches</p>
                  <p className="text-xs text-gray-500 mt-0.5">The Smart Engine will instantly find overlapping deals in your database.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center">3</div>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Close the Deal</p>
                  <p className="text-xs text-gray-500 mt-0.5">Drag them across the Kanban pipeline and get paid.</p>
                </div>
              </div>
            </div>

            <button onClick={() => router.push(pathname + '?adding=true')} className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition-all active:scale-95 flex justify-center items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               Add First Lead
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
             // @ts-ignore
             const health = getLeadHealth(lead.lastContactDate, lead.dateAdded);
             
             // --- LOGIC: Hide Health Dot for Dead/Closed leads ---
             const isInactive = ['dead', 'closed'].includes(lead.status);

             // --- SMART MATCH ENGINE ---
             const matches = findLeadMatches(lead, initialData);

             return (
               // --- ADDED PREFETCH BACK TO INSTANTLY LOAD LEAD PAGES ---
               <Link 
                 href={`/leads/${lead.id}`} 
                 prefetch={true}
                 key={lead.id} 
                 className="block bg-white p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
               >
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${['buyer', 'seller'].includes(lead.type) ? (lead.type === 'buyer' ? 'bg-blue-500' : 'bg-orange-500') : (lead.type === 'tenant' ? 'bg-indigo-500' : 'bg-purple-500')}`}></div>
                 <div className="flex justify-between items-start pl-3">
                   <div>
                     <div className="flex items-center gap-2 flex-wrap">
                       <h3 className="font-extrabold text-gray-900 text-base">{lead.name}</h3>
                       
                       {/* DYNAMIC ROLE BADGE (Tenant, Landlord, Buyer, Seller) */}
                       {lead.type && (
                         <span className={`px-1.5 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider ${getTypeBadgeStyles(lead.type)}`}>
                           {lead.type}
                         </span>
                       )}

                       {/* HEALTH DOT - Render ONLY if active */}
                       {!isInactive && (
                         <div className={`w-2.5 h-2.5 rounded-full ${health.color} border-2 border-white shadow-sm`} title={`Health: ${health.status} (${health.days}d)`}></div>
                       )}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>{lead.location}</span>
                        <span className="text-gray-300 mx-0.5">|</span>
                        <span>{lead.propertyType}</span>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-1.5">
                     <div className="flex gap-2 mb-1.5 mt-1">
                       <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors shadow-sm" title="Call">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                         <span className="text-[10px] font-bold">Call</span>
                       </a>
                       <a href={`https://wa.me/${(lead.whatsapp || lead.phone)?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#25D366] rounded-lg text-white hover:bg-[#20b858] transition-colors shadow-sm" title="WhatsApp">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                         <span className="text-[10px] font-bold">WhatsApp</span>
                       </a>
                     </div>
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${lead.status === 'new' ? 'bg-green-100 text-green-700' : lead.status === 'dead' ? 'bg-red-50 text-red-600' : lead.status === 'closed' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
                     {matches.length > 0 && !isInactive && (
                       <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                         ✨ {matches.length} Match{matches.length > 1 ? 'es' : ''}
                       </span>
                     )}
                   </div>
                 </div>
                 
                 {/* Reminder Indicator */}
                 {/* @ts-ignore */}
                 {lead.followUp && new Date(lead.followUp) > new Date() && (
                   <div className="ml-3 mt-2 flex items-center gap-1.5 bg-yellow-50 w-fit px-2 py-1 rounded-md">
                      <span className="text-[10px] font-bold text-yellow-700 flex items-center gap-1">⏰ Due: {new Date(lead.followUp).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                   </div>
                 )}

                 <hr className="border-gray-50 ml-3 my-2.5" />
                 <div className="bg-gray-50 p-2 rounded-lg">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{['buyer', 'tenant'].includes(lead.type) ? 'Budget Range' : 'Demand Price'}</p>
                   <div className="flex items-center gap-1">
                     <p className={`font-bold text-sm ${['buyer', 'seller'].includes(lead.type) ? 'text-gray-900' : 'text-gray-900'}`}>
                       {/* @ts-ignore */}
                       {formatIndianNumber(lead.budget || lead.demand || '0')}
                     </p>
                   </div>
                   <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 leading-none">
                     {/* @ts-ignore */}
                     {numberToWordsIndian(lead.budget || lead.demand || '0')}
                   </p>
                 </div>
               </Link>
             );
          })
        )}
        {hasMore && filteredLeads.length > 0 && activeTab === 'all' && (
          <div className="flex justify-center pt-6 pb-10">
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load Older Leads'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}