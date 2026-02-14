'use client';

import React, { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterBar({ onFilterChange, onSortChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    // Changed top-[60px] to top-0 so it sticks to the very top of the scroll area
    // Reduced padding (p-2 instead of p-3)
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      
      {/* --- COMPACT TOP ROW --- */}
      <div className="p-2 flex gap-2 items-center">
        <div className="relative flex-1">
          {/* Smaller Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          
          {/* Slimmer Input (py-1.5) and smaller text */}
          <input 
            type="text" 
            placeholder="Search Location..." 
            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
        
        {/* Filter Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded-lg border transition-colors ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>
      </div>

      {/* --- EXPANDABLE FILTERS (SLIM) --- */}
      {isOpen && (
        <div className="px-2 pb-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 border-t border-gray-100 bg-gray-50/50">
          
          {/* Min Price */}
          <div>
             <input 
               type="number" 
               placeholder="Min Budget" 
               className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-2"
               onChange={(e) => handleChange('minPrice', e.target.value)}
             />
          </div>

          {/* Max Price */}
          <div>
             <input 
               type="number" 
               placeholder="Max Budget" 
               className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-2"
               onChange={(e) => handleChange('maxPrice', e.target.value)}
             />
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-2">
            <select 
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Sort: Low to High</option>
              <option value="price_desc">Sort: High to Low</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}