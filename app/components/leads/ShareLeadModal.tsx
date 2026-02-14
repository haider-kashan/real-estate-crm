'use client';

import React, { useState, useMemo } from 'react';

type Lead = any; // Replace with your actual interface

interface ShareLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  allLeads: Lead[];
}

export default function ShareLeadModal({ isOpen, onClose, lead, allLeads }: ShareLeadModalProps) {
  const [shareSearch, setShareSearch] = useState('');

  // --- MATCHING LOGIC ---
  const matchingLeads = useMemo(() => {
    if (!lead) return [];
    
    let targetType = '';
    if (lead.type === 'tenant') targetType = 'landlord';
    else if (lead.type === 'landlord') targetType = 'tenant';
    else if (lead.type === 'buyer') targetType = 'seller';
    else if (lead.type === 'seller') targetType = 'buyer';

    let targets = allLeads.filter((l: Lead) => l.type === targetType);

    if (shareSearch) {
      const q = shareSearch.toLowerCase();
      targets = targets.filter((t: Lead) => t.name.toLowerCase().includes(q) || t.phone.includes(q));
    }

    return targets;
  }, [lead, allLeads, shareSearch]);

  const getTargetLabel = () => {
    if (!lead) return 'Leads';
    if (lead.type === 'tenant') return 'Landlords';
    if (lead.type === 'landlord') return 'Tenants';
    if (lead.type === 'buyer') return 'Sellers';
    if (lead.type === 'seller') return 'Buyers';
    return 'Leads';
  };

  const getShareMessage = () => {
    const typeLabel = lead.type === 'buyer' ? 'Buyer Req' :
                      lead.type === 'seller' ? 'House for Sale' :
                      lead.type === 'tenant' ? 'Tenant Req' : 'Rental Available';
    
    const priceLabel = ['buyer', 'tenant'].includes(lead.type) ? 'Budget' : 'Demand';
    const priceValue = lead.budget || lead.demand;
    const feats = Object.keys(lead.features || {}).filter(k => lead.features[k]).map(k => k.replace('has','').replace('is','')).join(', ');

    return `*${typeLabel} Available* 📢
    
📍 *${lead.location}*
💰 *${priceLabel}:* ${priceValue}
🏠 ${lead.propertyType} (${lead.size})
🛏 ${lead.bedrooms} Bed | ${lead.bathrooms} Bath
✨ ${feats}

_Let me know if this matches your requirement._`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lead: ${lead.name}`,
          text: getShareMessage(),
        });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(getShareMessage());
      alert("Details copied to clipboard!");
    }
    onClose();
  };

  const shareToLead = (targetPhone: string) => {
    const message = encodeURIComponent(getShareMessage());
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full h-[85vh] sm:h-auto sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Share This Lead</h3>
            <p className="text-xs text-gray-500">Matching {getTargetLabel()}</p>
          </div>
          <button onClick={onClose} className="bg-white p-1 rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Native Share Button */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <button onClick={handleNativeShare} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform hover:bg-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share via Apps (WhatsApp / SMS)
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pt-4 pb-2 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Send to {getTargetLabel()}</p>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder={`Search ${getTargetLabel()}...`} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" onChange={(e) => setShareSearch(e.target.value)} />
          </div>
        </div>

        {/* List of Matching Leads */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
          {matchingLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-50"><p className="text-sm font-bold text-gray-400">No matching {getTargetLabel().toLowerCase()} found.</p></div>
          ) : (
            matchingLeads.map((target) => (
              <button key={target.id} onClick={() => shareToLead(target.whatsapp || target.phone)} className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all active:scale-[0.98] text-left group">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-bold text-gray-900 text-sm">{target.name}</h4><span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${['buyer','seller'].includes(target.type) ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{target.type}</span></div>
                  <p className="text-xs text-gray-500 mt-0.5">{target.location}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}