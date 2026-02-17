'use client';

import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Lead } from '../../lib/data';
import InvoicePDF from './InvoicePDF';
import { getAgencyDetails } from '../../lib/auth-actions'; // <--- Import the server action

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export default function InvoiceModal({ isOpen, onClose, lead }: InvoiceModalProps) {
  if (!isOpen) return null;

  // --- STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  
  // Real Agency Data State
  const [agency, setAgency] = useState({
    name: "Loading Agency...",
    phone: "",
    email: "",
    address: "",
    logo: null as string | null
  });

  // Dynamic Items State
  const [items, setItems] = useState([
    { description: `Agency Commission (1% of Deal)`, amount: 0 },
    { description: "Documentation & Processing Fee", amount: 5000 }
  ]);

  const [total, setTotal] = useState(0);

  // --- 1. FETCH AGENCY DATA ON MOUNT ---
  useEffect(() => {
    const fetchAgency = async () => {
      const data = await getAgencyDetails();
      if (data) {
        setAgency({
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          logo: data.logo
        });
      }
    };
    fetchAgency();
  }, []);

  // --- CALCULATE TOTAL AUTOMATICALLY ---
  useEffect(() => {
    const sum = items.reduce((acc, item) => acc + (parseFloat(item.amount.toString()) || 0), 0);
    setTotal(sum);
  }, [items]);

  // --- HANDLERS ---
  const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const cleanLogo = agency.logo ? agency.logo.trim() : null;
    const invoiceData = {
      invoiceNo: invoiceNumber,
      date: invoiceDate,
      // USE REAL DB DATA HERE
      agencyName: agency.name,
      agencyPhone: agency.phone,
      agencyEmail: agency.email,
      agencyAddress: agency.address, // Added Address
      agencyLogo: cleanLogo,       // Added Logo
      
      clientName: lead.name,
      clientPhone: lead.phone,
      propertyRef: `Commission for sale of ${lead.propertyType} in ${lead.location}`,
      items: items,
      total: total
    };

    try {
      const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lead.name}_Invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => onClose(), 500); 
    } catch (error) {
      console.error(error);
      alert("Error creating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-xl text-gray-900">Create Invoice</h3>
            <p className="text-xs text-gray-500 mt-0.5">Billing for <span className="font-semibold text-blue-600">{lead.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex-1">
          
          {/* 1. Meta Details Box */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Invoice #</label>
              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* 2. Items List */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Line Items</h4>
              <button onClick={addItem} className="text-xs font-bold text-blue-600 hover:underline">+ Add Item</button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Description (e.g. Downpayment)" 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 uppercase">Total Payable</span>
              <span className="text-2xl font-extrabold text-gray-900">
                <span className="text-sm font-normal text-gray-400 mr-1">PKR</span>
                {new Intl.NumberFormat('en-PK').format(total)}
              </span>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 ${isGenerating ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'}`}
          >
            {isGenerating ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Download Invoice</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}