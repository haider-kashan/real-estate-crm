// app/leads/[id]/LeadClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLeadHealth } from '../../lib/utils';
import { deleteLead, updateLead } from '../../actions'; // Removed getLead, the server handles it now

// Component Imports
import ShareLeadModal from '../../components/leads/ShareLeadModal';
import EditLeadModal from '../../components/leads/EditLeadModal';
import ReminderModal from '../../components/leads/ReminderModal';
import InvoiceModal from '../../components/leads/InvoiceModal';

export default function LeadClient({ dbLead }: { dbLead: any }) {
  const router = useRouter();

  // --- STATES ---
  // Transform the database lead instantly on load. No more waiting!
  const [lead, setLead] = useState<any>(() => {
    if (!dbLead) return null;
    return {
      ...dbLead,
      dateAdded: dbLead.createdAt, 
      lastContactDate: dbLead.lastContacted,
      features: {
        hasBasement: dbLead.hasBasement,
        isCorner: dbLead.isCorner,
        isParkFacing: dbLead.isParkFacing,
        isMainRoad: dbLead.isMainRoad,
        hasServantQuarter: dbLead.hasServantQuarter,
      }
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // If the server didn't find the lead, show the not found page instantly
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-400">Lead Not Found</h1>
        <Link href="/" className="mt-4 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg">Go Back Home</Link>
      </div>
    );
  }

  // --- CALCULATE HEALTH ---
  // @ts-ignore
  const health = getLeadHealth(lead.lastContactDate, lead.dateAdded);

  // --- HANDLERS ---
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}? This cannot be undone.`)) {
      const result = await deleteLead(lead.id);
      if (result.success) {
        router.push('/');
      } else {
        alert("Error deleting lead.");
      }
    }
  };

  const handleUpdateLead = async (updatedData: any) => {
    setLead(updatedData); // Instant UI update
    
    // Flatten features for DB
    const payload = {
      ...updatedData,
      hasBasement: updatedData.features?.hasBasement,
      isCorner: updatedData.features?.isCorner,
      isParkFacing: updatedData.features?.isParkFacing,
      isMainRoad: updatedData.features?.isMainRoad,
      hasServantQuarter: updatedData.features?.hasServantQuarter,
    };
    try {
      const result = await updateLead(lead.id, payload);
      
      if (result.success) {
        setIsEditing(false); // Close modal on success
      } else {
        alert("Failed to save to database.");
      }
    } catch (error) {
      console.error("Database Update Error:", error);
    }   
  };

  const handleLogContact = async () => {
    const now = new Date();
    // @ts-ignore
    setLead(prev => ({ ...prev, lastContactDate: now }));
    await updateLead(lead.id, { lastContacted: now });
  };

  const handleSetReminder = async (isoDate: string) => {
    // @ts-ignore
    setLead(prev => prev ? ({ ...prev, followUp: isoDate }) : prev);
    await updateLead(lead.id, { followUp: isoDate });
  };

  const handleRemoveReminder = async () => {
    // @ts-ignore
    setLead(prev => prev ? ({ ...prev, followUp: null }) : prev);
    await updateLead(lead.id, { followUp: null });
  };

  const isSales = ['buyer', 'seller'].includes(lead.type);
  const themeBg = isSales ? 'bg-blue-600' : 'bg-indigo-600';
  const themeColor = isSales ? 'text-blue-600' : 'text-indigo-600';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-40 relative">
      
      {/* HEADER */}
      <header className={`px-4 py-3 text-white sticky top-0 z-20 flex items-center shadow-md ${themeBg}`}>
        <button onClick={() => router.back()} className="mr-3 p-2 hover:bg-white/20 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">{lead.name}</h1>
          <p className="text-xs text-white/80 font-medium uppercase tracking-wide">{lead.type} • {lead.status}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsInvoiceOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Invoice">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          <button onClick={() => setIsReminderOpen(true)} className="p-2 hover:bg-white/20 rounded-full relative" title="Reminder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            {/* @ts-ignore */}
            {lead.followUp && <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"></span>}
          </button>
          <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Share">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
          <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/20 rounded-full" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-white/20 rounded-full text-red-200 hover:text-white" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="p-4 space-y-4">

        {/* 1. HEALTH & STATUS CARD */}
        {!['dead', 'closed'].includes(lead.status) && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Health</p>
                {/* @ts-ignore */}
                <p className={`text-sm font-bold ${health.text}`}>{health.status}</p>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                {/* @ts-ignore */}
                <div className={`h-2 rounded-full ${health.color} transition-all duration-500`} style={{ width: `${health.score}%` }}></div>
             </div>
             <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Last contact: {health.days} days ago</p>
                <button onClick={handleLogContact} className="text-xs font-bold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all">
                   Mark Contacted
                </button>
             </div>
          </div>
        )}

        {/* 2. REMINDER CARD (If set) */}
        {/* @ts-ignore */}
        {lead.followUp && (
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm text-lg">⏰</div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-amber-700 uppercase">Next Follow Up</p>
                 {/* @ts-ignore */}
                 <p className="text-sm font-bold text-gray-900">{new Date(lead.followUp).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
              </div>
           </div>
        )}

        {/* 3. PRIMARY DETAILS CARD (Price & Location) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-5 border-b border-gray-50">
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">{['buyer', 'tenant'].includes(lead.type) ? 'Budget Range' : 'Demand Price'}</p>
             <p className={`text-3xl font-extrabold ${themeColor}`}>{/* @ts-ignore */}{lead.budget || lead.demand || 'N/A'}</p>
             <div className="mt-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-sm font-medium text-gray-700 leading-snug">{lead.location}</p>
             </div>
           </div>
           
           {/* Grid Specs */}
           <div className="grid grid-cols-2 divide-x divide-gray-50 bg-gray-50/50">
              <div className="p-4 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Property Type</p>
                 <p className="font-bold text-gray-900">{lead.propertyType}</p>
              </div>
              <div className="p-4 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Size</p>
                 <p className="font-bold text-gray-900">{lead.size || '-'}</p>
              </div>
           </div>
        </div>

        {/* 4. EXTENDED SPECS (Beds, Baths, Floors, etc.) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-50 pb-2">Specifications</h3>
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                 <p className="text-xs text-gray-500 mb-1">Floors</p>
                 <p className="font-bold text-gray-900 text-lg">{lead.floors || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                 <p className="text-xs text-gray-500 mb-1">Bedrooms</p>
                 <p className="font-bold text-gray-900 text-lg">{lead.bedrooms || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                 <p className="text-xs text-gray-500 mb-1">Bathrooms</p>
                 <p className="font-bold text-gray-900 text-lg">{lead.bathrooms || '-'}</p>
              </div>
           </div>

           {/* Features List */}
           {/* @ts-ignore */}
           {lead.features && Object.values(lead.features).some(Boolean) && (
             <div className="mt-5 pt-4 border-t border-gray-50">
               <p className="text-xs font-bold text-gray-400 uppercase mb-3">Key Features</p>
               <div className="flex flex-wrap gap-2">
                 {/* @ts-ignore */}
                 {lead.features.hasBasement && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Basement</span>}
                 {/* @ts-ignore */}
                 {lead.features.isCorner && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Corner</span>}
                 {/* @ts-ignore */}
                 {lead.features.isParkFacing && <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-semibold">Park Facing</span>}
                 {/* @ts-ignore */}
                 {lead.features.isMainRoad && <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold">Main Road</span>}
                 {/* @ts-ignore */}
                 {lead.features.hasServantQuarter && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Servant Qtr</span>}
               </div>
             </div>
           )}
        </div>

        {/* 5. NOTES & HISTORY */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Notes</h3>
           <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 min-h-[80px]">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{lead.notes || "No notes added."}</p>
           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-400">
                 <span>Added on</span>
                 {/* @ts-ignore */}
                 <span className="font-medium text-gray-600">{new Date(lead.dateAdded).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                 <span>Last Updated</span>
                 {/* @ts-ignore */}
                 <span className="font-medium text-gray-600">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}</span>
              </div>
           </div>
        </div>
        
        {/* 6. CONTACT DETAILS (Explicit) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-20">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Contact Info</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">📞</div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                        <p className="text-sm font-bold text-gray-900">{lead.phone}</p>
                    </div>
                </div>
                {lead.whatsapp && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">💬</div>
                        <div>
                            <p className="text-xs text-green-700/60 font-bold uppercase">WhatsApp</p>
                            <p className="text-sm font-bold text-green-800">{lead.whatsapp}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-40 pb-6 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call
          </a>
          {/* @ts-ignore */}
          <a href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, '')}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
             WhatsApp
          </a>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ShareLeadModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        lead={lead} 
        allLeads={[]} 
      />

      <EditLeadModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)}
        lead={lead} 
        onSave={handleUpdateLead} 
      />

      <ReminderModal 
        isOpen={isReminderOpen} 
        onClose={() => setIsReminderOpen(false)} 
        /* @ts-ignore */
        currentFollowUp={lead.followUp}
        onSet={handleSetReminder}
        onRemove={handleRemoveReminder}
      />

      <InvoiceModal 
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        lead={lead}
      />

    </div>
  );
}