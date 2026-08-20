'use client';

import React from 'react';
import Link from 'next/link';
import { findLeadMatches } from '@/app/lib/utils';

export default function MatchesClient({ leads }: { leads: any[] }) {
  // We want to compute matches globally.
  // We should create a unique list of pairs so that A matches B is not duplicated as B matches A.
  
  const pairedMatches: any[] = [];
  const seenPairs = new Set<string>();

  leads.forEach((lead) => {
    // Only check active leads
    if (['dead', 'closed'].includes(lead.status)) return;

    const matches = findLeadMatches(lead, leads);
    matches.forEach((matchObj: any) => {
      // Create a unique key for the pair to avoid duplicates
      const pairKey = [lead.id, matchObj.match.id].sort().join('-');
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        
        // Let's ensure the Buyer/Tenant is always on the left for consistency
        const isLead1Buyer = ['buyer', 'tenant'].includes(lead.type);
        const lead1 = isLead1Buyer ? lead : matchObj.match;
        const lead2 = isLead1Buyer ? matchObj.match : lead;

        pairedMatches.push({
          lead1,
          lead2,
          reason: matchObj.reason
        });
      }
    });
  });

  if (pairedMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 mt-4 shadow-sm">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
            <span className="text-3xl opacity-50">✨</span>
        </div>
        <p className="text-sm font-bold text-gray-900">No matches found</p>
        <p className="text-xs text-gray-500 mt-1 max-w-[250px]">Add more leads to let the Smart Engine find overlapping deals in your database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pairedMatches.map((pair, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100 relative overflow-hidden group">
            
            {/* Top Match Reason Badge (Prevents mobile overlay text blocking) */}
            <div className="mb-3 text-center">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-200/80 shadow-2xs group-hover:scale-105 transition-transform max-w-full text-wrap leading-tight">
                ✨ {pair.reason}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-2.5 sm:gap-4 relative">
                {/* Lead 1 (Usually Buyer) */}
                <Link href={`/leads/${pair.lead1.id}`} className="flex-1 bg-gray-50/90 hover:bg-blue-50/60 rounded-xl p-3 transition-colors cursor-pointer group/card border border-transparent hover:border-blue-100 block">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 block ${['buyer', 'tenant'].includes(pair.lead1.type) ? 'text-blue-600' : 'text-purple-600'}`}>
                        {pair.lead1.type}
                    </span>
                    <h4 className="font-bold text-gray-900 group-hover/card:text-blue-600 text-xs sm:text-sm truncate">{pair.lead1.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{pair.lead1.location}</p>
                    <p className="text-xs font-bold text-gray-900 mt-1.5">PKR {pair.lead1.budget || pair.lead1.demand}</p>
                </Link>

                {/* Lead 2 (Usually Seller) */}
                <Link href={`/leads/${pair.lead2.id}`} className="flex-1 bg-gray-50/90 hover:bg-purple-50/60 rounded-xl p-3 transition-colors cursor-pointer group/card text-left sm:text-right border border-transparent hover:border-purple-100 block">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 block ${['buyer', 'tenant'].includes(pair.lead2.type) ? 'text-blue-600' : 'text-purple-600'}`}>
                        {pair.lead2.type}
                    </span>
                    <h4 className="font-bold text-gray-900 group-hover/card:text-purple-600 text-xs sm:text-sm truncate">{pair.lead2.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{pair.lead2.location}</p>
                    <p className="text-xs font-bold text-gray-900 mt-1.5">PKR {pair.lead2.budget || pair.lead2.demand}</p>
                </Link>
            </div>
            
            {/* Call Action Triggers with 44px Minimum Touch Target */}
            <div className="mt-3 flex gap-2">
                <a href={`tel:${pair.lead1.phone}`} className="flex-1 bg-gray-900 hover:bg-black text-white text-xs font-bold min-h-[44px] py-2.5 px-2 rounded-xl flex items-center justify-center text-center active:scale-95 transition-transform shadow-xs">
                  Call {pair.lead1.name.split(' ')[0]}
                </a>
                <a href={`tel:${pair.lead2.phone}`} className="flex-1 bg-gray-900 hover:bg-black text-white text-xs font-bold min-h-[44px] py-2.5 px-2 rounded-xl flex items-center justify-center text-center active:scale-95 transition-transform shadow-xs">
                  Call {pair.lead2.name.split(' ')[0]}
                </a>
            </div>
        </div>
      ))}
    </div>
  );
}
