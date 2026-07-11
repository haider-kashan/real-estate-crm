'use client';

import React, { useTransition } from 'react';
import { updateLead } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function FollowUpsClient({ leads }: { leads: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClear = (id: number) => {
    startTransition(async () => {
      await updateLead(id, { followUp: null });
      router.refresh();
    });
  };

  const handleReschedule = (id: number, dateString: string) => {
    startTransition(async () => {
      // Ensure the time is set so it doesn't default to previous day based on timezone
      const newDate = new Date(dateString);
      newDate.setHours(12, 0, 0, 0); 
      await updateLead(id, { followUp: newDate });
      router.refresh();
    });
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-gray-900">Inbox Zero!</h3>
        <p className="text-sm text-gray-500 mt-1">You have no pending follow-ups today. Take a break or find new leads!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => {
        const isOverdue = new Date(lead.followUp) < new Date(new Date().setHours(0,0,0,0));
        
        return (
          <div key={lead.id} className={`p-5 rounded-2xl border ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'} shadow-sm relative overflow-hidden`}>
            {/* Urgency Indicator */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverdue ? 'bg-red-500' : 'bg-blue-500'}`} />
            
            <div className="pl-2">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{lead.name}</h4>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{lead.type} • {lead.status}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        {isOverdue ? (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Overdue</span>
                        ) : (
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Upcoming</span>
                        )}
                        <span className="text-[11px] font-extrabold text-gray-500">
                           {new Date(lead.followUp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                
                <p className="text-sm text-gray-600 font-medium mb-4">
                    {lead.location || "No location"} • PKR {lead.budget || lead.demand || "0"}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                    <a href={`tel:${lead.phone}`} className="flex-1 bg-gray-900 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-md shadow-gray-900/20 active:scale-95 transition-transform">
                        Call Now
                    </a>
                    <a href={`https://wa.me/92${lead.whatsapp || lead.phone}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#25D366]/20 active:scale-95 transition-transform">
                        WhatsApp
                    </a>
                </div>

                {/* Management Buttons */}
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <button 
                       onClick={() => handleClear(lead.id)}
                       disabled={isPending}
                       className="flex-1 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        Mark Done
                    </button>
                    <div className="flex-1 relative">
                        <input 
                           type="date" 
                           disabled={isPending}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           onChange={(e) => {
                             if (e.target.value) handleReschedule(lead.id, e.target.value);
                           }}
                        />
                        <button 
                           className="w-full py-1.5 text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50/50 rounded-lg active:scale-95 transition-all pointer-events-none"
                        >
                            📅 Schedule
                        </button>
                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
