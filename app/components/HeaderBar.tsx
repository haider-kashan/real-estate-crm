'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ReminderItem {
  id: string | number;
  name: string;
  phone: string;
  type: 'overdue' | 'today';
}

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  theme?: 'white' | 'blue' | 'indigo';
  reminders?: ReminderItem[];
  showBack?: boolean; // <--- NEW PROP
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  onAddClick: () => void;
}

export default function HeaderBar({ 
  title, 
  subtitle, 
  theme = 'white', 
  reminders = [], 
  showBack = false, // Default false
  onFilterChange, 
  onSortChange, 
  onAddClick 
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

  return (
    <div className={`sticky top-0 z-30 shadow-sm ${bgColor}`}>
      <div className="flex justify-between items-center p-4 relative">
        
        {/* TITLE / BACK BUTTON / SEARCH */}
        {!isSearchOpen ? (
          <div className="flex items-center gap-3">
            {/* BACK BUTTON LOGIC */}
            {showBack && (
              <button 
                onClick={() => router.push('/')} 
                className={`p-1.5 rounded-full -ml-2 transition-colors ${isColored ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
              >
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
              onChange={(e) => handleChange('location', e.target.value)}
              onBlur={(e) => !e.target.value && setIsSearchOpen(false)}
            />
          </div>
        )}

        {/* ICONS ACTIONS */}
        <div className="flex gap-2 items-center">
          
          {/* 1. SEARCH TOGGLE */}
          {!isSearchOpen && (
            <button onClick={() => setIsSearchOpen(true)} className={`w-10 h-10 rounded-full flex items-center justify-center ${btnClass}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          )}

          {/* 2. NOTIFICATIONS BELL */}
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsFilterOpen(false); }} 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isNotifOpen ? 'bg-white text-blue-600 shadow-md' : btnClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              {reminders.length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in zoom-in-95 origin-top-right">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Action Required ({reminders.length})</h3>
                  <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-2">
                  {reminders.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-4">No pending actions 🎉</p>
                  ) : (
                    reminders.map((r, i) => (
                      <div 
                        key={i}
                        onClick={() => router.push(`/leads/${r.id}`)}
                        className={`p-3 rounded-lg border-l-[3px] shadow-sm bg-white hover:bg-gray-50 transition-colors group cursor-pointer ${r.type === 'overdue' ? 'border-red-500' : 'border-amber-500'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${r.type === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              {r.type}
                            </span>
                            <h4 className="font-bold text-gray-900 mt-1">{r.name}</h4>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{r.phone}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. FILTER TOGGLE */}
          <button onClick={() => { setIsFilterOpen(!isFilterOpen); setIsNotifOpen(false); }} className={`w-10 h-10 rounded-full flex items-center justify-center ${isFilterOpen ? 'bg-white text-blue-600 shadow-md' : btnClass}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>

          {/* 4. ADD BUTTON */}
          <button onClick={onAddClick} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${isColored ? 'bg-white text-blue-600 font-bold' : 'bg-blue-600 text-white'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>

      {/* EXPANDED FILTERS */}
      {isFilterOpen && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 bg-black/5 p-4 backdrop-blur-sm">
           <select className="col-span-2 w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('propertyType', e.target.value)}>
             <option value="">All Property Types</option>
             <option value="House">House</option>
             <option value="Flat">Flat</option>
             <option value="Plot">Plot</option>
             <option value="Portion">Portion</option>
             <option value="Commercial">Commercial</option>
           </select>
           <input type="number" placeholder="Min Price" className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('minPrice', e.target.value)} />
           <input type="number" placeholder="Max Price" className="w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => handleChange('maxPrice', e.target.value)} />
           <select className="col-span-2 w-full px-3 py-2 bg-white rounded-lg text-sm text-gray-900 outline-none shadow-sm" onChange={(e) => onSortChange(e.target.value)}>
             <option value="newest">Sort: Newest First</option>
             <option value="price_asc">Sort: Price Low to High</option>
             <option value="price_desc">Sort: Price High to Low</option>
           </select>
        </div>
      )}
    </div>
  );
}