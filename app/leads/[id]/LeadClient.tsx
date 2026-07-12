'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLeadHealth, formatIndianNumber, numberToWordsIndian, findLeadMatches } from '../../lib/utils';
import { deleteLead, updateLead, trackEvent, updateInvoiceStatus } from '../../actions'; 
import { updateLeadStickyNote, addLeadActivityLog } from '../../lib/lead-actions';
// Component Imports
import ShareLeadModal from '../../components/leads/ShareLeadModal';
import EditLeadModal from '../../components/leads/EditLeadModal';
import ReminderModal from '../../components/leads/ReminderModal';
import InvoiceModal from '../../components/leads/InvoiceModal';

export default function LeadClient({ dbLead, allLeads = [] }: { dbLead: any, allLeads?: any[] }) {
  const router = useRouter();

  // --- STATES ---
  const [lead, setLead] = useState<any>(() => {
    if (!dbLead) return null;
    return {
      ...dbLead,
      dateAdded: dbLead.createdAt, 
      lastContactDate: dbLead.lastContacted,
      logs: dbLead.logs || [],
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
  
  // Sticky Note State
  const [stickyNote, setStickyNote] = useState(lead?.notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Activity Log State
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogType, setNewLogType] = useState<'call' | 'whatsapp' | 'meeting' | 'system'>('call');
  const [isAddingLog, setIsAddingLog] = useState(false);

  // Dropdown States
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt'>('invoice');

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-400">Lead Not Found</h1>
        <Link href="/" className="mt-4 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg">Go Back Home</Link>
      </div>
    );
  }

  const health = getLeadHealth(lead.lastContactDate, lead.dateAdded);

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
    setLead({ ...lead, ...updatedData }); 
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
        setIsEditing(false); 
      } else {
        alert("Failed to save to database.");
      }
    } catch (error) {
      console.error("Database Update Error:", error);
    }   
  };

  const handleLogContact = async () => {
    const now = new Date();
    setLead((prev: any) => ({ ...prev, lastContactDate: now }));
    await updateLead(lead.id, { lastContacted: now });
    trackEvent('mark_contacted');
  };

  const handleSetReminder = async (isoDate: string) => {
    setLead((prev: any) => prev ? ({ ...prev, followUp: isoDate }) : prev);
    await updateLead(lead.id, { followUp: isoDate });
    trackEvent('set_reminder');
  };

  const handleRemoveReminder = async () => {
    setLead((prev: any) => prev ? ({ ...prev, followUp: null }) : prev);
    await updateLead(lead.id, { followUp: null });
  };

  // --- NEW HANDLERS FOR NOTES AND LOGS ---
  const handleSaveStickyNote = async () => {
    setIsSavingNote(true);
    const result = await updateLeadStickyNote(lead.id, stickyNote);
    if (result.success) {
      setLead((prev: any) => ({ ...prev, notes: stickyNote }));
    } else {
      alert("Failed to save note.");
    }
    setIsSavingNote(false);
  };

  const handleAddLog = async () => {
    if (!newLogContent.trim()) return;
    setIsAddingLog(true);
    
    // We pass lead.userId so the server knows which agent created this log
    const result = await addLeadActivityLog(lead.id, lead.userId, newLogType, newLogContent);
    
    if (result.success) {
      // Optimistically update the UI so they don't have to refresh
      const newLog = {
        id: Date.now(), // temporary ID
        type: newLogType,
        content: newLogContent,
        date: new Date().toISOString()
      };
      
      setLead((prev: any) => ({ 
        ...prev, 
        logs: [newLog, ...(prev.logs || [])],
        lastContactDate: new Date() 
      }));
      setNewLogContent(''); // Clear the input
    } else {
      alert("Failed to add activity log.");
    }
    setIsAddingLog(false);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'whatsapp': return '💬';
      case 'meeting': return '🤝';
      case 'system': return '🤖';
      default: return '📝';
    }
  };

  const isSales = ['buyer', 'seller'].includes(lead.type);
  const themeBg = isSales ? 'bg-blue-600' : 'bg-indigo-600';
  const themeColor = isSales ? 'text-blue-600' : 'text-indigo-600';

  const matches = findLeadMatches(lead, allLeads);

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
          <button onClick={() => setIsDocMenuOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Create Document">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          
          <button onClick={() => setIsReminderOpen(true)} className="p-2 hover:bg-white/20 rounded-full relative" title="Reminder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            {lead.followUp && <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"></span>}
          </button>
          
          <button onClick={() => { trackEvent('click_share'); setIsShareModalOpen(true); }} className="p-2 hover:bg-white/20 rounded-full" title="Share">
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
        
        {/* HEALTH CARD */}
        {!['dead', 'closed'].includes(lead.status) && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Health</p>
                <p className={`text-sm font-bold ${health.text}`}>{health.status}</p>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
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

        {/* FOLLOW UP CARD */}
        {lead.followUp && (
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm text-lg">⏰</div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-amber-700 uppercase">Next Follow Up</p>
                 <p className="text-sm font-bold text-gray-900">{new Date(lead.followUp).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
              </div>
           </div>
        )}

        {/* BUDGET & LOCATION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-5 border-b border-gray-50">
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">{['buyer', 'tenant'].includes(lead.type) ? 'Budget Range' : 'Demand Price'}</p>
             <p className={`text-3xl font-extrabold ${themeColor}`}>
               <span className="text-lg opacity-70 mr-1">PKR</span>
               {formatIndianNumber(lead.budget || lead.demand || '0')}
             </p>
             <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wide">
               {numberToWordsIndian(lead.budget || lead.demand || '0')}
             </p>
             <div className="mt-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-sm font-medium text-gray-700 leading-snug">{lead.location}</p>
             </div>
           </div>
           
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

        {/* SPECIFICATIONS */}
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

           {lead.features && Object.values(lead.features).some(Boolean) && (
             <div className="mt-5 pt-4 border-t border-gray-50">
               <p className="text-xs font-bold text-gray-400 uppercase mb-3">Key Features</p>
               <div className="flex flex-wrap gap-2">
                 {lead.features.hasBasement && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Basement</span>}
                 {lead.features.isCorner && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Corner</span>}
                 {lead.features.isParkFacing && <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-semibold">Park Facing</span>}
                 {lead.features.isMainRoad && <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold">Main Road</span>}
                 {lead.features.hasServantQuarter && <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">Servant Qtr</span>}
               </div>
             </div>
           )}
        </div>

        {/* --- 1. THE STICKY NOTE (Editable) --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Sticky Notes</h3>
           <div className="relative">
             <textarea 
               value={stickyNote}
               onChange={(e) => setStickyNote(e.target.value)}
               placeholder="Add general remarks here (e.g., Wife's name, prefers calls after 5pm...)"
               className="w-full bg-yellow-50 p-4 rounded-xl border border-yellow-200 min-h-[100px] text-sm text-gray-700 outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none"
             />
             {stickyNote !== (lead.notes || '') && (
               <button 
                 onClick={handleSaveStickyNote}
                 disabled={isSavingNote}
                 className="absolute bottom-3 right-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50"
               >
                 {isSavingNote ? 'Saving...' : 'Save Note'}
               </button>
             )}
           </div>
        </div>

        {/* --- 2. ACTIVITY TIMELINE FEED --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Activity Timeline</h3>
           
           {/* Add New Log Form */}
           <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6">
             <div className="flex gap-2 mb-3">
               <select 
                 value={newLogType} 
                 onChange={(e) => setNewLogType(e.target.value as any)}
                 className="bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-2 py-1.5 outline-none"
               >
                 <option value="call">📞 Call</option>
                 <option value="whatsapp">💬 WhatsApp</option>
                 <option value="meeting">🤝 Meeting</option>
                 <option value="system">📝 General</option>
               </select>
             </div>
             <textarea 
                value={newLogContent}
                onChange={(e) => setNewLogContent(e.target.value)}
                placeholder="Log a recent finding..."
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black transition-colors resize-none h-20 mb-2"
             />
             <div className="flex justify-end">
               <button 
                 onClick={handleAddLog}
                 disabled={isAddingLog || !newLogContent.trim()}
                 className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
               >
                 {isAddingLog ? 'Adding...' : 'Add to Timeline'}
               </button>
             </div>
           </div>

           {/* The Feed */}
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.1rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
             {lead.logs && lead.logs.length > 0 ? (
               lead.logs.map((log: any) => (
                 <div key={log.id} className="relative flex items-start gap-4">
                   <div className="absolute left-0 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-lg z-10 shadow-sm">
                     {getLogIcon(log.type)}
                   </div>
                   <div className="pl-14 pt-1 flex-1">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                       {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700">
                       {log.content}
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <p className="text-center text-sm text-gray-400 font-medium py-4">No activity logged yet.</p>
             )}
           </div>
        </div>

        {/* --- FINANCIALS & INVOICES --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase">Financials</h3>
            <button onClick={() => setIsDocMenuOpen(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              + Create New
            </button>
          </div>
          
          <div className="space-y-3">
            {lead.invoices && lead.invoices.length > 0 ? (
              lead.invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {invoice.status === 'paid' ? '🧾' : '📄'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Rs. {invoice.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 font-medium">Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {/* INTERACTIVE STATUS BADGE */}
                    <span 
                      onClick={async () => {
                        const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';
                        
                        // 1. Optimistic UI update
                        setLead((prev: any) => ({
                          ...prev,
                          invoices: prev.invoices.map((inv: any) => 
                            inv.id === invoice.id ? { ...inv, status: newStatus } : inv
                          )
                        }));
                        
                        // 2. Database update
                        await updateInvoiceStatus(invoice.id, newStatus);
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all hover:opacity-80 active:scale-95
                        ${invoice.status === 'paid' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
                    >
                      {invoice.status}
                    </span>
                    
                    {invoice.dueDate && invoice.status !== 'paid' && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-400 font-medium py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No invoices generated yet.</p>
            )}
          </div>
        </div>
        {/* ------------------------------- */}

        {/* --- SMART MATCHES --- */}
        {matches.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl shadow-sm border border-amber-100 mb-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-6xl opacity-10">✨</div>
            <h3 className="text-sm font-bold text-amber-900 uppercase mb-3 flex items-center gap-2">
              <span>Smart Matches</span>
              <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">{matches.length}</span>
            </h3>
            <div className="space-y-3 relative z-10">
              {matches.map(({ match, reason }) => (
                <Link href={`/leads/${match.id}`} key={match.id} className="block bg-white p-3 border border-amber-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{match.name}</h4>
                      <p className="text-xs font-bold text-amber-600 uppercase mt-0.5">{match.type}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      {reason}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 font-medium mt-2">
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{match.location}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{formatIndianNumber(match.budget || match.demand || '0')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* CONTACT INFO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-20">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Contact Info</h3>
            <div className="space-y-3">
                <a href={`tel:${lead.phone || ''}`} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 active:scale-95 transition-transform hover:bg-gray-100 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">📞</div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-bold uppercase">Phone Number</p>
                        <p className="text-sm font-bold text-gray-900">{lead.phone}</p>
                    </div>
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </a>

                {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 active:scale-95 transition-transform hover:bg-gray-100 cursor-pointer">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">✉️</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{lead.email}</p>
                        </div>
                        <div className="text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </a>
                )}

                {lead.whatsapp && (
                    <a href={`https://wa.me/${String(lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-green-50 p-3 rounded-xl border border-green-100/50 active:scale-95 transition-transform hover:bg-green-100 cursor-pointer">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">💬</div>
                        <div className="flex-1">
                            <p className="text-xs text-green-700/60 font-bold uppercase">WhatsApp</p>
                            <p className="text-sm font-bold text-green-800">{lead.whatsapp}</p>
                        </div>
                        <div className="text-green-600/50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </a>
                )}
            </div>
        </div>

      </div>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-40 pb-6 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <a 
            href={`tel:${lead.phone || ''}`} 
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call
          </a>
          <a 
            href={`https://wa.me/${String(lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
             WhatsApp
          </a>
        </div>
      </div>

      {/* --- BOTTOM SHEET FOR DOCUMENT TYPE --- */}
      {isDocMenuOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsDocMenuOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-12 relative animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Document</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => { setDocumentType('invoice'); setIsInvoiceOpen(true); setIsDocMenuOpen(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 active:scale-95 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl">📄</div>
                <div>
                  <p className="font-bold text-gray-900">Create an invoice</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bill your client for services</p>
                </div>
              </button>

              <button 
                onClick={() => { setDocumentType('receipt'); setIsInvoiceOpen(true); setIsDocMenuOpen(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 active:scale-95 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl">🧾</div>
                <div>
                  <p className="font-bold text-gray-900">Create a receipt</p>
                  <p className="text-xs text-gray-500 mt-0.5">Proof of payment received</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <ShareLeadModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} lead={lead} allLeads={allLeads} />
      <EditLeadModal isOpen={isEditing} onClose={() => setIsEditing(false)} lead={lead} onSave={handleUpdateLead} />
      <ReminderModal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} currentFollowUp={lead.followUp} onSet={handleSetReminder} onRemove={handleRemoveReminder} />
      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} lead={lead} type={documentType} />

    </div>
  );
}