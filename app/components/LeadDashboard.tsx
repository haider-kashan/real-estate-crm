'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderBar, { ReminderItem } from './HeaderBar';
import AddLeadModal from './AddLead';
import { parsePrice, getLeadHealth } from '../lib/utils'; 

interface LeadDashboardProps {
  title: string;
  initialData: any[]; 
  department: 'sales' | 'rentals' | 'all'; 
  tabs?: { id: string; label: string }[];
  reminders?: ReminderItem[];
}

export default function LeadDashboard({ title, initialData, department, tabs }: LeadDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get('adding') === 'true';

  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].id : 'all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', propertyType: '' });
  const [sortBy, setSortBy] = useState('newest');

  const theme = department === 'sales' ? 'blue' : (department === 'rentals' ? 'indigo' : 'white');
  const accentText = department === 'sales' ? 'text-blue-600' : (department === 'rentals' ? 'text-indigo-600' : 'text-gray-900');
  const accentBorder = department === 'sales' ? 'border-blue-600' : (department === 'rentals' ? 'border-indigo-600' : 'border-gray-900');
  const activeChipBg = department === 'sales' ? 'bg-blue-600' : (department === 'rentals' ? 'bg-indigo-600' : 'bg-gray-900');
  const statuses = ['all', 'new', 'contacted', 'interested', 'negotiation', 'closed', 'dead'];

  // --- 1. ACTION CENTER LOGIC (For Bell Icon) ---
  const urgentLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString(); 

    // @ts-ignore
    return initialData.filter(l => {
      // Check 1: Reminder Due?
      let isReminderDue = false;
      if (l.followUp) {
        const date = new Date(l.followUp);
        isReminderDue = date < now || date.toDateString() === todayStr;
      }

      // Check 2: Health Critical?
      // @ts-ignore
      const health = getLeadHealth(l.lastContactDate, l.dateAdded);
      const isCritical = health.status === 'Critical' && l.status !== 'closed' && l.status !== 'dead';

      return isReminderDue || isCritical;
    }).sort((a, b) => {
       // Reminders on top
       if (a.followUp && !b.followUp) return -1;
       return 0;
    });
  }, [initialData]);

  const headerReminders: ReminderItem[] = urgentLeads.map(l => {
      const now = new Date();
      // @ts-ignore
      const health = getLeadHealth(l.lastContactDate, l.dateAdded);
      
      let type: 'overdue' | 'today' | 'critical' = 'overdue';
      
      if (health.status === 'Critical' && l.status !== 'closed' && l.status !== 'dead') {
        type = 'critical';
      } else if (l.followUp) {
        const fDate = new Date(l.followUp);
        const isToday = fDate.toDateString() === now.toDateString();
        type = isToday ? 'today' : 'overdue';
      }

      return {
          id: l.id,
          name: l.name,
          phone: l.phone,
          type: type,
          daysAgo: health.days
      }
  });

  const filteredLeads = useMemo(() => {
    let result = initialData;
    if (activeTab !== 'all') result = result.filter(l => l.type === activeTab);
    if (activeStatus !== 'all') result = result.filter(l => l.status === activeStatus);
    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter(l => l.location.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
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
  }, [filters, sortBy, activeTab, activeStatus, initialData]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <HeaderBar 
          title={title} 
          subtitle={`${filteredLeads.length} Leads`} 
          theme={theme} 
          reminders={headerReminders} 
          showBack={department !== 'all'} 
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
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="bg-gray-200 p-4 rounded-full mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
            <p className="text-sm font-bold text-gray-900">No leads found</p>
            <p className="text-xs text-gray-500">Tap + to add lead</p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
             // @ts-ignore
             const health = getLeadHealth(lead.lastContactDate, lead.dateAdded);
             
             return (
               <div key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="block bg-white p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${['buyer', 'seller'].includes(lead.type) ? (lead.type === 'buyer' ? 'bg-blue-500' : 'bg-orange-500') : (lead.type === 'tenant' ? 'bg-indigo-500' : 'bg-purple-500')}`}></div>
                 <div className="flex justify-between items-start pl-3">
                   <div>
                     <div className="flex items-center gap-2">
                       <h3 className="font-extrabold text-gray-900 text-base">{lead.name}</h3>
                       {/* HEALTH DOT */}
                       <div className={`w-2.5 h-2.5 rounded-full ${health.color} border-2 border-white shadow-sm`} title={`Health: ${health.status} (${health.days}d)`}></div>
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>{lead.location}</span>
                        <span className="text-gray-300 mx-0.5">|</span>
                        <span>{lead.propertyType}</span>
                     </div>
                   </div>
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${lead.status === 'new' ? 'bg-green-100 text-green-700' : lead.status === 'dead' ? 'bg-red-50 text-red-600' : lead.status === 'closed' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
                 </div>
                 
                 {/* Reminder Indicator */}
                 {/* @ts-ignore */}
                 {lead.followUp && new Date(lead.followUp) > new Date() && (
                   <div className="ml-3 mt-2 flex items-center gap-1.5 bg-yellow-50 w-fit px-2 py-1 rounded-md">
                      <span className="text-[10px] font-bold text-yellow-700 flex items-center gap-1">⏰ Due: {new Date(lead.followUp).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                   </div>
                 )}

                 <hr className="border-gray-50 ml-3 my-2.5" />
                 <div className="flex justify-between items-center pl-3">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{['buyer', 'tenant'].includes(lead.type) ? 'Budget Range' : 'Demand Price'}</p>
                   <div className="flex items-center gap-1"><p className={`font-bold text-sm ${['buyer', 'seller'].includes(lead.type) ? 'text-gray-900' : 'text-gray-900'}`}>{/* @ts-ignore */}{lead.budget || lead.demand}</p></div>
                 </div>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
}