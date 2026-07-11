'use client';

import React, { useEffect, useState } from 'react';
import { addLead } from '../actions'; // <--- 1. Import the Server Action
import { formatIndianNumber, numberToWordsIndian } from '../lib/utils';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  forcedType?: 'buyer' | 'seller' | 'tenant' | 'landlord';
  department?: 'sales' | 'rentals' | 'all';
}

export default function AddLeadModal({ isOpen, onClose, forcedType, department = 'all' }: AddLeadModalProps) {
  
  // --- STATE FOR "ALL" WINDOW LOGIC ---
  const [selectedDept, setSelectedDept] = useState<'sales' | 'rentals' | null>(
    department === 'all' ? null : department
  );

  // Default Role based on department
  const [role, setRole] = useState<'buyer' | 'seller' | 'tenant' | 'landlord'>(
    forcedType || (department === 'rentals' ? 'tenant' : 'buyer')
  );

  // Toggle for "Same as above" logic
  const [useSamePhone, setUseSamePhone] = useState(false);
  const [loading, setLoading] = useState(false); // <--- 2. Loading State

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    status: 'new',
    phone: '',
    whatsapp: '', 
    location: '',
    budget: '', 
    demand: '',
    propertyType: 'House',
    size: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    features: {
      hasBasement: false,
      isCorner: false,
      isParkFacing: false,
      isMainRoad: false,
      hasServantQuarter: false
    },
    notes: ''
  });

  // UX State for Progressive Disclosure
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedDept(department === 'all' ? null : department);
      setRole(forcedType || (department === 'rentals' ? 'tenant' : 'buyer'));
      setUseSamePhone(false);
      setLoading(false);
      setShowAdvanced(false); // Reset to hide advanced fields on new open
      setFormData({
        name: '', status: 'new', phone: '', whatsapp: '', location: '', budget: '', demand: '',
        propertyType: 'House', size: '', bedrooms: '', bathrooms: '', floors: '',
        features: { hasBasement: false, isCorner: false, isParkFacing: false, isMainRoad: false, hasServantQuarter: false },
        notes: ''
      });
    }
  }, [isOpen, department, forcedType]);

  // Sync WhatsApp
  useEffect(() => {
    if (useSamePhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [formData.phone, useSamePhone]);

  const toggleFeature = (key: string) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key as keyof typeof prev.features] }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDATION CHECKS ---
    if (!formData.name.trim()) { alert("Please enter the Full Name."); return; }
if (!formData.phone.trim()) { alert("Please enter the Primary Call number."); return; }

const priceValue = ['buyer', 'tenant'].includes(role) ? formData.budget : formData.demand;

if (!priceValue?.trim()) {
  alert("Please enter the Budget/Demand price.");
  return;
}

if (!/^03\d{9}$/.test(formData.phone)) {
  alert("Phone number must be 11 digits and start with 03.");
  return;
}

if (formData.whatsapp && !/^03\d{9}$/.test(formData.whatsapp)) {
  alert("WhatsApp number must be 11 digits and start with 03.");
  return;
}

if (!formData.location.trim()) {
  alert("Please enter location.");
  return;
}

if (!/^\d+$/.test(priceValue)) {
  alert("Price must contain numbers only.");
  return;
}

setLoading(true);

    setLoading(true); // Start Loading

    // --- 3. PREPARE PAYLOAD FOR DATABASE ---
    // We need to flatten 'features' so it matches the Database Schema
    const payload = {
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      location: formData.location,
      type: role,
      status: formData.status,
      propertyType: formData.propertyType,
      size: formData.size,
      
      // Handle Budget vs Demand based on role
      budget: ['buyer', 'tenant'].includes(role) ? formData.budget : undefined,
      demand: ['seller', 'landlord'].includes(role) ? formData.demand : undefined,
      
      floors: formData.floors,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      
      // Spread the features directly (Flattening)
      ...formData.features, 
      
      notes: formData.notes
    };

    // --- 4. CALL SERVER ACTION ---
    const result = await addLead(payload);

    setLoading(false); // Stop Loading

    if (result.success) {
      onClose(); // Close the modal automatically
    } else {
      alert("Failed to save lead. Please check the console.");
      console.error(result.error);
    }
  };

  if (!isOpen) return null;

  // --- STEP 1: DEPARTMENT SELECTOR ---
  if (department === 'all' && !selectedDept) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
        <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95">
          
          <div className="mb-6">
            <h3 className="font-bold text-xl text-gray-900">Add New Lead</h3>
            <p className="text-sm text-gray-500 mt-1">Select the department to continue</p>
          </div>

          <div className="space-y-3">
            {/* Sales Card */}
            <button 
              onClick={() => { setSelectedDept('sales'); setRole('buyer'); }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group text-left active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div className="ml-4 flex-1">
                 <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Sales Department</h4>
                 <p className="text-xs text-gray-500 mt-0.5">Buying & Selling Properties</p>
              </div>
              <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </button>

            {/* Rentals Card */}
            <button 
              onClick={() => { setSelectedDept('rentals'); setRole('tenant'); }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div className="ml-4 flex-1">
                 <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Rentals Department</h4>
                 <p className="text-xs text-gray-500 mt-0.5">Tenants & Landlords</p>
              </div>
              <div className="text-gray-300 group-hover:text-indigo-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </button>
          </div>

          <button onClick={onClose} className="w-full mt-6 py-3 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  // --- STEP 2: THE FORM ---
  const isSales = selectedDept === 'sales' || ['buyer', 'seller'].includes(role);
  const themeBtn = isSales ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Add Lead</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{isSales ? 'Sales Dept' : 'Rentals Dept'}</p>
          </div>
          <button onClick={onClose} className="bg-white p-1 rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* ROLE TOGGLE */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg shrink-0 border border-gray-200">
              <button type="button" 
                onClick={() => setRole(isSales ? 'buyer' : 'tenant')}
                className={`py-2.5 text-xs font-bold rounded-md transition-all shadow-sm ${role === (isSales ? 'buyer' : 'tenant') ? 'bg-white text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {isSales ? 'BUYER' : 'TENANT'}
              </button>
              <button type="button"
                onClick={() => setRole(isSales ? 'seller' : 'landlord')}
                className={`py-2.5 text-xs font-bold rounded-md transition-all shadow-sm ${role === (isSales ? 'seller' : 'landlord') ? 'bg-white text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {isSales ? 'SELLER' : 'LANDLORD'}
              </button>
          </div>

          {/* 1. Essential Info (Always Visible) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Essential Info</h4>
            
            {/* Name & Location Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {['buyer', 'tenant'].includes(role) ? 'Location Preference' : 'Property Location'}
                </label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>

            {/* Phone & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Primary Call <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, '')
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
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

            {/* Budget / Demand (Crucial for Sales/Rentals) */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {['buyer', 'tenant'].includes(role) ? 'Max Budget' : 'Demand Price'} <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={formatIndianNumber(['buyer', 'tenant'].includes(role) ? formData.budget : formData.demand)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (['buyer', 'tenant'].includes(role)) {
                    setFormData({ ...formData, budget: val, demand: '' });
                  } else {
                    setFormData({ ...formData, demand: val, budget: '' });
                  }
                }}
              />
              <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                {numberToWordsIndian(['buyer', 'tenant'].includes(role) ? formData.budget : formData.demand)}
              </p>
            </div>
          </div>

          {/* PROGRESSIVE DISCLOSURE TOGGLE BUTTON */}
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-2.5 mt-2 border border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {showAdvanced ? (
               <>Hide Advanced Property Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg></>
            ) : (
               <>Add Advanced Property Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></>
            )}
          </button>

          {/* 2. Advanced Details (Hidden by Default) */}
          {showAdvanced && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
              
              {/* Secondary Contact */}
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
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none ${useSamePhone ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                  placeholder="03001234567"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                  disabled={useSamePhone}
                />
              </div>

              {/* Property Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase">Property Type</label>
                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500" 
                       value={formData.propertyType} 
                       onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                   >
                       <option value="House">House</option>
                       <option value="Portion">Portion</option>
                       <option value="Flat">Flat</option>
                       <option value="Plot">Plot</option>
                       <option value="Commercial">Commercial</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase">Size</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                     placeholder="e.g. 10 Marla" 
                     value={formData.size} 
                     onChange={(e) => setFormData({...formData, size: e.target.value})} 
                   />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Floors</label>
                    <input type="number" min="0" max="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500" value={formData.floors} onChange={(e) => setFormData({...formData, floors: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Beds</label>
                     <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Baths</label>
                     <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
                  </div>
              </div>

              {/* Advanced Features */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Advanced Features</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys(formData.features).map((key) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={formData.features[key as keyof typeof formData.features]}
                            onChange={() => toggleFeature(key)}
                            />
                            <span className="text-xs text-gray-700 font-medium capitalize">
                                {key.replace('has', '').replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </label>
                    ))}
                </div>
              </div>

              {/* Notes */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Notes</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Add detailed requirements..." 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

            </div>
          )}

          {/* Footer Action */}
          <div className="pt-2">
             <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${themeBtn}`}
             >
                {loading ? (
                    <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Saving...</span>
                    </>
                ) : (
                    `Save ${role.charAt(0).toUpperCase() + role.slice(1)} Lead`
                )}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}