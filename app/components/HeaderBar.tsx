'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 1. UPDATE INTERFACE: Added 'date' so we can show "Due: Feb 12"
export interface ReminderItem {
  id: string | number;
  name: string;
  type: 'overdue' | 'today' | 'critical';
  daysAgo?: number;
  date?: string; // ISO String for reminders
}

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  theme?: 'white' | 'blue' | 'indigo';
  reminders?: ReminderItem[];
  showBack?: boolean;
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  onAddClick: () => void;
}

export default function HeaderBar({ 
  title, subtitle, theme = 'white', reminders = [], showBack = false, 
  onFilterChange, onSortChange, onAddClick 
}: HeaderBarProps) {
  
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', propertyType: '' });

  const isColored = theme !== 'white';
  const bgColor = theme === 'white' ? 'bg-white border-b border-gray-200' : theme === 'blue' ? 'bg-blue-600' : 'bg-indigo-600';
  const textColor = isColored ? 'text-white' : 'text-gray-900';
  const btnClass = isColored ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600';

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Helper to format dates nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`sticky top-0 z-30 shadow-sm ${bgColor}`}>
      <div className="flex justify-between items-center p-4 relative">
        
        {/* TITLE / BACK / SEARCH */}
        {!isSearchOpen ? (
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={() => router.push('/')} className={`p-1.5 rounded-full -ml-2 transition-colors ${isColored ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <div>
              <h1 className={`text-xl font-bold tracking-wide ${textColor}`}>{title}</h1>
              {subtitle && <p className={`text-xs font-medium opacity-80 ${textColor}`}>{subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex-1 mr-3 animate-in fade-in slide-in-from-right-4">
            <input type="text" placeholder="Search location or name..." autoFocus className="w-full bg-white rounded-full px-4 py-2 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              onChange={(e) => handleChange('location', e.target.value)} onBlur={(e) => !e.target.value && setIsSearchOpen(false)}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-2 items-center">
          {!isSearchOpen && (
            <button onClick={() => setIsSearchOpen(true)} className={`w-10 h-10 rounded-full flex items-center justify-center ${btnClass}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          )}

          {/* NOTIFICATIONS BELL */}
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsFilterOpen(false); }} 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isNotifOpen ? 'bg-white text-blue-600 shadow-md' : btnClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              {reminders.length > 0 && <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {/* DROPDOWN MENU */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 origin-top-right">
                
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{reminders.length} New</span>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                  {reminders.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">🎉</div>
                      <p className="text-gray-400 text-xs font-medium">All caught up!</p>
                    </div>
                  ) : (
                    reminders.map((r, i) => {
                      const isCritical = r.type === 'critical';
                      const isOverdue = r.type === 'overdue';
                      
                      // Dynamic Styles based on type
                      const cardBg = isCritical ? 'bg-red-50/50 hover:bg-red-50' : 'bg-white hover:bg-gray-50';
                      const iconBg = isCritical ? 'bg-red-100 text-red-600' : isOverdue ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600';
                      const borderClass = isCritical ? 'border-red-100' : isOverdue ? 'border-amber-100' : 'border-gray-100';

                      return (
                        <button 
                          key={i} 
                          onClick={() => router.push(`/leads/${r.id}`)}
                          className={`w-full text-left p-3 rounded-xl border ${borderClass} ${cardBg} flex gap-3 items-start transition-all active:scale-[0.98] group`}
                        >
                          {/* ICON */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} shadow-sm`}>
                            {isCritical ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path><path d="M4 2C2.8 3.7 2 5.7 2 8"></path><path d="M22 8c0-2.3-.8-4.3-2-6"></path></svg>
                            )}
                          </div>

                          {/* TEXT CONTENT */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isCritical ? 'text-red-600' : isOverdue ? 'text-amber-600' : 'text-blue-600'}`}>
                                 {isCritical ? 'Critical Health' : isOverdue ? 'Reminder Overdue' : 'Upcoming'}
                               </p>
                            </div>
                            
                            <h4 className="font-bold text-gray-900 text-sm truncate">{r.name}</h4>
                            
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              {isCritical ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                  Inactive for {r.daysAgo} days
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                  {r.type === 'overdue' ? 'Was due: ' : 'Due: '} {formatDate(r.date)}
                                </>
                              )}
                            </p>
                          </div>
                          
                          {/* CHEVRON */}
                          <div className="text-gray-300 group-hover:text-gray-500 transition-colors pt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { setIsFilterOpen(!isFilterOpen); setIsNotifOpen(false); }} className={`w-10 h-10 rounded-full flex items-center justify-center ${isFilterOpen ? 'bg-white text-blue-600 shadow-md' : btnClass}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg></button>
          <button onClick={onAddClick} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${isColored ? 'bg-white text-blue-600 font-bold' : 'bg-blue-600 text-white'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 bg-black/5 p-4 backdrop-blur-sm">
           <select className="col-span-2 w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('propertyType', e.target.value)}><option value="">All Property Types</option><option value="House">House</option><option value="Flat">Flat</option><option value="Plot">Plot</option><option value="Portion">Portion</option><option value="Commercial">Commercial</option></select>
           <input type="number" placeholder="Min Price" className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('minPrice', e.target.value)} />
           <input type="number" placeholder="Max Price" className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('maxPrice', e.target.value)} />
           <select className="col-span-2 w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => onSortChange(e.target.value)}><option value="newest">Sort: Newest First</option><option value="price_asc">Sort: Price Low to High</option><option value="price_desc">Sort: Price High to Low</option></select>
        </div>
      )}
    </div>
  );
}