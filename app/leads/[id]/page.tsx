'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { allLeads } from '../../lib/data';
import { getLeadHealth } from '../../lib/utils'; // Import the shared utility

// Component Imports
import ShareLeadModal from '../../components/leads/ShareLeadModal';
import EditLeadModal from '../../components/leads/EditLeadModal';
import ReminderModal from '../../components/leads/ReminderModal';
import InvoiceModal from '../../components/leads/InvoiceModal';
import LeadHealth from '../../components/leads/LeadHealth';

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const initialLead = allLeads.find((l) => l.id.toString() === id);

  // --- STATES ---
  const [lead, setLead] = useState(initialLead);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-400">Lead Not Found</h1>
        <Link href="/" className="mt-4 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg">Go Back Home</Link>
      </div>
    );
  }

  // --- CALCULATE HEALTH ---
  // We now use the shared utility with the specific date fields requested
  // @ts-ignore
  const health = getLeadHealth(lead.lastContactDate, lead.dateAdded);

  // --- HANDLERS ---
  const handleDelete = () => {
    if (window.confirm(`Delete ${lead.name}?`)) {
      alert("Lead Deleted!");
      router.push('/');
    }
  };

  const handleUpdateLead = (updatedData: any) => {
    setLead(updatedData);
    alert("Lead Updated!");
  };

  const handleSetReminder = (isoDate: string) => {
    // @ts-ignore
    setLead(prev => prev ? ({ ...prev, followUp: isoDate }) : prev);
    alert(`Reminder set!`);
  };

  const handleRemoveReminder = () => {
    // @ts-ignore
    setLead(prev => prev ? ({ ...prev, followUp: null }) : prev);
    alert("Reminder removed!");
  };

  const isSales = ['buyer', 'seller'].includes(lead.type);
  const themeBg = isSales ? 'bg-blue-600' : 'bg-indigo-600';
  const themeColor = isSales ? 'text-blue-600' : 'text-indigo-600';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-40 relative">
      
      {/* HEADER */}
      <header className={`p-4 text-white sticky top-0 z-10 flex items-center shadow-md ${themeBg}`}>
        <button onClick={() => router.back()} className="mr-4 p-1 hover:bg-white/20 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-lg font-bold tracking-wide flex-1">Lead Details</h1>
        <div className="flex gap-1">
          
          {/* INVOICE BUTTON */}
          <button onClick={() => setIsInvoiceOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Generate Invoice">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>

          {/* REMINDER BELL */}
          <button onClick={() => setIsReminderOpen(true)} className="p-2 hover:bg-white/20 rounded-full relative" title="Set Reminder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            {/* Show dot if active */}
            {/* @ts-ignore */}
            {lead.followUp && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
          </button>

          <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Share">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
          <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/20 rounded-full" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-white/20 rounded-full text-red-100 hover:text-white" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </header>

      {/* INFO CARD */}
      <div className="bg-white p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${isSales ? 'border-blue-100 text-blue-600' : 'border-indigo-100 text-indigo-600'}`}>{lead.type}</span>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${lead.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{lead.name}</h1>
        <p className="text-gray-500 flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {lead.location}
        </p>

        {/* --- HEALTH SCORE BAR --- */}
        <div className="mt-6">
           <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health Score</span>
              <span className={`text-xs font-bold ${health.text}`}>{health.label}</span>
           </div>
           <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${health.color} transition-all duration-500 ${health.alert ? 'animate-pulse' : ''}`} 
                style={{ width: `${health.percent}%` }}
              ></div>
           </div>
           {/* @ts-ignore */}
           {health.alert && <p className="text-[10px] text-red-500 font-bold mt-1">Action Required: Contact this lead immediately.</p>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* --- REMINDER BANNER --- */}
        {/* @ts-ignore */}
        {lead.followUp && (
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-lg">🔔</div>
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Reminder Set</p>
                  {/* @ts-ignore */}
                  <p className="text-sm font-bold text-gray-900">{new Date(lead.followUp).toDateString()}</p>
                </div>
              </div>
              <button onClick={() => setIsReminderOpen(true)} className="text-xs font-bold text-amber-700 underline">Change</button>
           </div>
        )}

        {/* Price & Details */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">{['buyer', 'tenant'].includes(lead.type) ? 'Budget Range' : 'Demand Price'}</p>
          <p className={`text-3xl font-bold ${themeColor} mb-4`}>{/* @ts-ignore */}{lead.budget || lead.demand}</p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div><p className="text-xs text-gray-400 font-bold uppercase">Type</p><p className="font-semibold text-gray-900">{lead.propertyType || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase">Size</p><p className="font-semibold text-gray-900">{/* @ts-ignore */}{lead.size || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase">Floors</p><p className="font-semibold text-gray-900">{/* @ts-ignore */}{lead.floors || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-400 font-bold uppercase">Beds / Baths</p><p className="font-semibold text-gray-900">{/* @ts-ignore */}{lead.bedrooms || '-'} / {lead.bathrooms || '-'}</p></div>
          </div>
        </div>

        {/* Features */}
        {/* @ts-ignore */}
        {lead.features && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {/* @ts-ignore */}
              {lead.features.hasBasement && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Basement</span>}
              {/* @ts-ignore */}
              {lead.features.isCorner && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Corner</span>}
              {/* @ts-ignore */}
              {lead.features.isParkFacing && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">Park Facing</span>}
              {/* @ts-ignore */}
              {lead.features.isMainRoad && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Main Road</span>}
              {/* @ts-ignore */}
              {lead.features.hasServantQuarter && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Servant Qtr</span>}
            </div>
          </div>
        )}

        {/* Notes */}
        {/* @ts-ignore */}
        {lead.notes && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Notes</h3>
            {/* @ts-ignore */}
            <p className="text-sm text-gray-600 leading-relaxed">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-20 left-0 w-full px-4 z-40"> 
        <div className="flex gap-3 bg-white p-3 rounded-2xl shadow-xl border border-gray-200">
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">Call</a>
          {/* @ts-ignore */}
          <a href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, '')}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">WhatsApp</a>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ShareLeadModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        lead={lead} 
        allLeads={allLeads} 
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

      {/* NEW INVOICE MODAL */}
      <InvoiceModal 
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        lead={lead}
      />

    </div>
  );
}