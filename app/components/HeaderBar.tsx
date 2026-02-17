'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationCenter, { ReminderItem } from './NotificationCenter';
import UserMenu from './UserMenu';

export type { ReminderItem };

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  theme?: 'white' | 'blue' | 'indigo';
  reminders?: ReminderItem[];
  showBack?: boolean;
  user?: { name: string; email: string };
  // 1. MAKE THESE OPTIONAL with '?'
  onFilterChange?: (filters: any) => void;
  onSortChange?: (sort: string) => void;
  onAddClick?: () => void;
}

export default function HeaderBar({ 
  title, subtitle, theme = 'white', reminders = [], showBack = false, 
  user,
  onFilterChange, onSortChange, onAddClick 
}: HeaderBarProps) {
  
  const router = useRouter();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', propertyType: '' });

  const isColored = theme !== 'white';
  const bgColor = theme === 'white' ? 'bg-white border-b border-gray-200' : theme === 'blue' ? 'bg-blue-600' : 'bg-indigo-600';
  const textColor = isColored ? 'text-white' : 'text-gray-900';
  const btnClass = isColored ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600';

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters); // Only call if exists
  };

  return (
    <div className={`sticky top-0 z-30 shadow-sm ${bgColor}`}>
      <div className="flex justify-between items-center p-4 relative">
        
        {/* TITLE / BACK / SEARCH */}
        {!isSearchOpen ? (
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={() => router.back()} className={`p-1.5 rounded-full -ml-2 transition-colors ${isColored ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-900'}`}>
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
          
          {/* SEARCH TOGGLE - Only show if onFilterChange exists */}
          {!isSearchOpen && onFilterChange && (
            <button onClick={() => setIsSearchOpen(true)} className={`w-10 h-10 rounded-full flex items-center justify-center ${btnClass}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          )}

          {/* NOTIFICATION CENTER */}
          <NotificationCenter reminders={reminders} />

          {/* FILTER TOGGLE - Only show if onFilterChange exists */}
          {onFilterChange && (
            <button onClick={() => { setIsFilterOpen(!isFilterOpen); }} className={`w-10 h-10 rounded-full flex items-center justify-center ${isFilterOpen ? 'bg-white text-blue-600 shadow-md' : btnClass}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
          )}

          {/* ADD BUTTON - Only show if onAddClick exists */}
          {onAddClick && (
            <button onClick={onAddClick} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${isColored ? 'bg-white text-blue-600 font-bold' : 'bg-blue-600 text-white'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          )}

          {/* USER MENU */}
          {user && <UserMenu name={user.name} email={user.email} />} 

        </div>
      </div>

      {isFilterOpen && onSortChange && (
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