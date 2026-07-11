'use client';

import React, { useState, useEffect } from 'react';
import { formatIndianNumber, numberToWordsIndian } from '../../lib/utils';

// Use 'any' to keep it flexible as requested
type Lead = any; 

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSave: (updatedLead: Lead) => void;
}

export default function EditLeadModal({ isOpen, onClose, lead, onSave }: EditLeadModalProps) {
  const [editForm, setEditForm] = useState<Lead | null>(null);
  const [useSamePhone, setUseSamePhone] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (lead && isOpen) {
      setEditForm({
        ...lead,
        // Ensure features object exists so checkboxes don't crash
        features: lead.features || {
          hasBasement: false, isCorner: false, isParkFacing: false, isMainRoad: false, hasServantQuarter: false
        }
      });
      
      // Check if phone and whatsapp are currently the same
      if (lead.phone && lead.whatsapp && lead.phone === lead.whatsapp) {
        setUseSamePhone(true);
      }
    }
  }, [lead, isOpen]);

  // Sync WhatsApp with Phone if "Same as above" is checked
  useEffect(() => {
    if (useSamePhone && editForm) {
      setEditForm((prev: any) => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [editForm?.phone, useSamePhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    // --- VALIDATION CHECKS ---
    if (!editForm.name?.trim()) {
      alert("Please enter the Full Name.");
      return;
    }
    if (!editForm.phone?.trim()) {
      alert("Please enter the Primary Call number.");
      return;
    }
    if (!editForm.propertyType?.trim()) {
      alert("Please select or enter a Property Type.");
      return;
    }
    // Check Budget or Demand depending on type
    const priceField = ['buyer', 'tenant'].includes(editForm.type) ? editForm.budget : editForm.demand;
    if (!priceField?.toString().trim()) {
      alert("Please enter the Budget/Demand price.");
      return;
    }

    // Pass data back to Parent (which handles the DB save)
    onSave(editForm);
    onClose();
  };

  const toggleFeature = (key: string) => {
    setEditForm((prev: any) => {
      if (!prev) return null;
      return { 
        ...prev, 
        features: { 
          ...prev.features, 
          [key]: !prev.features[key] 
        } 
      };
    });
  };

  if (!isOpen || !editForm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Edit Lead</h3>
          <button onClick={onClose} className="bg-white p-1 rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* 1. Basic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Basic Info</h4>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Location Preference</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={editForm.location} 
                onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                value={editForm.status} 
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
                <option value="dead">Dead</option>
              </select>
            </div>
          </div>

          {/* 2. Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Contact Details</h4>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Primary Call <span className="text-red-500">*</span></label>
              <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="0300-1234567"
                value={editForm.phone} 
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">WhatsApp</label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" 
                    checked={useSamePhone} 
                    onChange={(e) => setUseSamePhone(e.target.checked)} 
                  />
                  <span className="text-[10px] text-gray-500 font-medium">Same as above</span>
                </label>
              </div>
              <input type="tel" className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none ${useSamePhone ? 'bg-gray-100 text-gray-500' : ''}`} 
                placeholder="0300-1234567"
                value={editForm.whatsapp || editForm.phone} 
                onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                disabled={useSamePhone}
              />
            </div>
          </div>

          {/* 3. Property Details */}
          <div className="space-y-3">
             <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Property Details</h4>
             
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Property Type <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none" 
                    placeholder="House"
                    value={editForm.propertyType} 
                    onChange={(e) => setEditForm({...editForm, propertyType: e.target.value})} 
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Size</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none" 
                    placeholder="e.g. 10 Marla" 
                    value={editForm.size} 
                    onChange={(e) => setEditForm({...editForm, size: e.target.value})} 
                  />
               </div>
             </div>
             
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {['buyer', 'tenant'].includes(editForm.type) ? 'Max Budget' : 'Demand Price'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  value={formatIndianNumber(editForm.budget || editForm.demand || '')} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if(['buyer', 'tenant'].includes(editForm.type)) setEditForm({...editForm, budget: val, demand: undefined});
                    else setEditForm({...editForm, demand: val, budget: undefined});
                  }}
                />
                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                  {numberToWordsIndian(editForm.budget || editForm.demand || '')}
                </p>
              </div>

             <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Floors</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none" 
                      value={editForm.floors || ''} onChange={(e) => setEditForm({...editForm, floors: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Beds</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none" 
                      value={editForm.bedrooms || ''} onChange={(e) => setEditForm({...editForm, bedrooms: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Baths</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none" 
                      value={editForm.bathrooms || ''} onChange={(e) => setEditForm({...editForm, bathrooms: e.target.value})} 
                    />
                 </div>
             </div>
          </div>

          {/* 4. Features (Checkboxes) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Features</h4>
            <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={editForm.features?.hasBasement || false}
                    onChange={() => toggleFeature('hasBasement')}
                  />
                  <span className="text-sm text-gray-700">Basement</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={editForm.features?.isCorner || false}
                    onChange={() => toggleFeature('isCorner')}
                  />
                  <span className="text-sm text-gray-700">Corner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={editForm.features?.isParkFacing || false}
                    onChange={() => toggleFeature('isParkFacing')}
                  />
                  <span className="text-sm text-gray-700">Park Facing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={editForm.features?.isMainRoad || false}
                    onChange={() => toggleFeature('isMainRoad')}
                  />
                  <span className="text-sm text-gray-700">Main Road</span>
                </label>

                {/* ADDED MISSING SERVANT QUARTER CHECKBOX */}
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={editForm.features?.hasServantQuarter || false}
                    onChange={() => toggleFeature('hasServantQuarter')}
                  />
                  <span className="text-sm text-gray-700">Servant Qtr</span>
                </label>
            </div>
          </div>

          {/* 5. Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Notes</h4>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              placeholder="Add detailed requirements..." 
              value={editForm.notes} 
              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
            ></textarea>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
             <button type="submit" className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gray-900 hover:bg-black transition-colors active:scale-[0.98]">
               Save Lead
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}