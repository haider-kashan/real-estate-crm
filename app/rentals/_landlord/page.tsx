'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { rentalLeads } from '../../lib/data';
import HeaderBar from '../../components/HeaderBar'; // <--- NEW HEADER
import AddLeadModal from '../../components/AddLead';
import { parsePrice } from '../../lib/utils';

export default function LandlordPage() {
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    // 1. Start with ONLY Landlords
    let result = rentalLeads.filter(l => l.type === 'landlord');

    // 2. Search
    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter(l => l.location.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
    }
    // 3. Price Filter
    // @ts-ignore
    if (filters.minPrice) result = result.filter(l => parsePrice(l.demand) >= parseFloat(filters.minPrice));
    // @ts-ignore
    if (filters.maxPrice) result = result.filter(l => parsePrice(l.demand) <= parseFloat(filters.maxPrice));

    // 4. Sort
    if (sortBy === 'price_asc') { /* @ts-ignore */ result.sort((a, b) => parsePrice(a.demand) - parsePrice(b.demand)); }
    else if (sortBy === 'price_desc') { /* @ts-ignore */ result.sort((a, b) => parsePrice(b.demand) - parsePrice(a.demand)); }
    else { result.sort((a, b) => b.id - a.id); }

    return result;
  }, [filters, sortBy]);

  return (
    <div className="flex flex-col min-h-full">
      {/* HEADER BAR (Title + 3 Circles) */}
      <HeaderBar 
        title="Landlords List" 
        subtitle={`${filteredLeads.length} Active Properties`}
        onFilterChange={setFilters} 
        onSortChange={setSortBy} 
        onAddClick={() => setIsModalOpen(true)}
      />
      
      {/* Modal forced to 'landlord' */}
      <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} department="rentals" forcedType="landlord" />

      <div className="p-3 space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No landlords found.</div>
        ) : (
          filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`} className="block bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
              <div className="flex justify-between items-start pl-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{lead.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lead.location}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${lead.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
              </div>
              <hr className="border-gray-50 ml-2 my-2" />
              <div className="flex justify-between items-center pl-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Demand</p>
                {/* @ts-ignore */}
                <p className="font-bold text-sm text-indigo-600">{lead.demand}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}