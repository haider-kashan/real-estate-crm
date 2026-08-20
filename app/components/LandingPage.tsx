'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'matching' | 'hub' | 'health' | 'pipeline' | 'pricing'>('matching');
  const [demoPriceInput, setDemoPriceInput] = useState<string>('45000000');

  // Helper function to format Lakh/Crore Indian numbers
  const formatIndianNumber = (val: string) => {
    const numStr = val.replace(/[^0-9]/g, '');
    if (!numStr) return '';
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const numberToWordsIndian = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num === 0) return '';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';

    let str = '';
    str += (parseInt(n[1], 10) !== 0) ? (a[parseInt(n[1], 10)] || b[parseInt(n[1][0], 10)] + ' ' + a[parseInt(n[1][1], 10)]) + 'Crore ' : '';
    str += (parseInt(n[2], 10) !== 0) ? (a[parseInt(n[2], 10)] || b[parseInt(n[2][0], 10)] + ' ' + a[parseInt(n[2][1], 10)]) + 'Lakh ' : '';
    str += (parseInt(n[3], 10) !== 0) ? (a[parseInt(n[3], 10)] || b[parseInt(n[3][0], 10)] + ' ' + a[parseInt(n[3][1], 10)]) + 'Thousand ' : '';
    str += (parseInt(n[4], 10) !== 0) ? (a[parseInt(n[4], 10)] || b[parseInt(n[4][0], 10)] + ' ' + a[parseInt(n[4][1], 10)]) + 'Hundred ' : '';
    str += (parseInt(n[5], 10) !== 0) ? ((str !== '') ? 'and ' : '') + (a[parseInt(n[5], 10)] || b[parseInt(n[5][0], 10)] + ' ' + a[parseInt(n[5][1], 10)]) : '';

    return str.trim() + ' Only';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      
      {/* REAL APP HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="EstatePulse Logo" 
              width={32} 
              height={32} 
              className="object-contain drop-shadow-sm"
              priority
            />
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-wide text-gray-900 flex items-center gap-1.5">
                <span>EstatePulse</span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 rounded-full uppercase tracking-wider">
                  Mobile CRM
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 px-2.5 py-2.5 min-h-[44px] flex items-center transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <span>Dashboard</span>
              <span className="text-base">➔</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH REAL APP MOCKUP */}
      <section className="px-3 pt-6 pb-10 sm:pt-14 sm:pb-16 max-w-4xl mx-auto text-center">
        {/* Pilot Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>SaaS Real Estate Lead Hub</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-gray-900 leading-[1.15] mb-3">
          The High-Speed CRM for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Real Estate Professionals
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-gray-600 max-w-xl mx-auto mb-6 leading-relaxed font-medium px-2">
          Centralize client leads, auto-match Buyers with Sellers, monitor lead health recency, and dispatch WhatsApp deal previews—built 100% for mobile speed.
        </p>

        {/* Action Buttons (Enforced 44px Minimum Touch Targets) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8 px-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-sm font-bold bg-gray-900 hover:bg-black text-white px-6 py-3.5 min-h-[48px] rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Open CRM Dashboard</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-extrabold uppercase">Free Pilot</span>
          </Link>
          <Link
            href="/login?demo=true"
            className="w-full sm:w-auto text-sm font-bold bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-6 py-3.5 min-h-[48px] rounded-xl shadow-xs active:scale-95 transition flex items-center justify-center"
          >
            🔑 Explore Demo Account
          </Link>
        </div>

        {/* REAL APP UI HERO MOCKUP CARD (1:1 PARITY WITH LEADDASHBOARD) */}
        <div className="relative max-w-sm mx-auto bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-gray-200 text-left overflow-hidden">
          
          {/* HeaderBar Component Mockup */}
          <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="EstatePulse Logo" width={24} height={24} className="object-contain" />
              <div>
                <h3 className="text-xs font-bold text-gray-900">EstatePulse</h3>
                <p className="text-[10px] text-gray-400 font-medium">14 Active Leads</p>
              </div>
            </div>

            {/* Real HeaderBar Action Buttons */}
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" title="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              
              {/* Notification Center with Red Badge */}
              <div className="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">2</span>
              </div>

              {/* Filter Button */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" title="Filter">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </div>

              {/* Add Lead Circle Button */}
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs" title="Add Lead">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
            </div>
          </div>

          {/* Department Tabs Bar */}
          <div className="flex border-b border-gray-100 text-xs font-bold text-gray-500 mb-2">
            <span className="flex-1 py-1.5 text-center text-gray-900 border-b-2 border-gray-900">All</span>
            <span className="flex-1 py-1.5 text-center hover:text-gray-900">Sales</span>
            <span className="flex-1 py-1.5 text-center hover:text-gray-900">Rentals</span>
          </div>

          {/* Real App Status Pills Bar */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none text-xs font-bold">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full whitespace-nowrap shadow-xs">all (14)</span>
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full whitespace-nowrap">new</span>
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full whitespace-nowrap">contacted</span>
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full whitespace-nowrap">interested</span>
          </div>

          {/* REAL APP LEAD CARD 1 (BUYER) */}
          <div className="block bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden mb-2">
            {/* Real Left Accent Bar - Blue for Buyer */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
            
            <div className="flex justify-between items-start pl-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm">Kashan Haider</h3>
                  <span className="px-1.5 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100">
                    BUYER
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-xs" title="Health: Healthy (2d)"></div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>DHA Phase 6</span>
                  <span className="text-gray-300">|</span>
                  <span>1 Kanal Plot</span>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gray-900 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span className="text-[10px] font-bold">Call</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#25D366] rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-green-100 text-green-700">NEW</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100 shadow-2xs">
                    ✨ 3 Matches
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-50 ml-2.5 my-2" />

            <div className="bg-gray-50 p-2 rounded-lg ml-2.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Budget Range</p>
              <p className="font-extrabold text-xs sm:text-sm text-gray-900">45,000,000</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 leading-tight">Four Crore Fifty Lakh Only</p>
            </div>
          </div>

          {/* REAL APP BOTTOM NAVIGATION (6 TABS) */}
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100 text-[10px] font-bold text-gray-400">
            <div className="flex flex-col items-center text-gray-900">
              <div className="p-1 px-2 rounded-full bg-gray-900 text-white shadow-xs mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              </div>
              <span className="text-[9px]">Dashboard</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-1 px-2 rounded-full text-gray-400 mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <span className="text-[9px]">Sales</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-1 px-2 rounded-full text-gray-400 mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path></svg>
              </div>
              <span className="text-[9px]">Rentals</span>
            </div>

            <div className="flex flex-col items-center text-orange-500">
              <div className="p-1 px-2 rounded-full text-gray-400 mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
              </div>
              <span className="text-[9px]">Pipeline</span>
            </div>

            <div className="flex flex-col items-center text-red-500">
              <div className="p-1 px-2 rounded-full text-gray-400 mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              </div>
              <span className="text-[9px]">Tasks</span>
            </div>

            <div className="flex flex-col items-center text-amber-500">
              <div className="p-1 px-2 rounded-full text-gray-400 mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
              </div>
              <span className="text-[9px]">Matches</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE REAL ESTATE LEAD FEATURE SHOWCASE */}
      <section className="px-3 py-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Core Real Estate CRM Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-1">
            Real App Features & Workflows
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">
            Explore the exact lead management features built into the EstatePulse CRM.
          </p>
        </div>

        {/* Tab Selector (Scrollable Horizontal Container on Mobile) */}
        <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-none pb-2 mb-6 flex gap-2 justify-start sm:justify-center text-xs font-extrabold px-1">
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 min-h-[44px] ${
              activeTab === 'matching'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ✨ Algorithmic Matching
          </button>
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 min-h-[44px] ${
              activeTab === 'hub'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            📱 Centralized Lead Hub
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 min-h-[44px] ${
              activeTab === 'health'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🟢 Lead Health Scoring
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 min-h-[44px] ${
              activeTab === 'pipeline'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            📋 Touch Kanban Pipeline
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 min-h-[44px] ${
              activeTab === 'pricing'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🏷️ Lakh / Crore Engine
          </button>
        </div>

        {/* Tab Showcase Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-7 border border-gray-200 shadow-md">
          {activeTab === 'matching' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>✨ Smart Lead Matching Engine</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-extrabold">
                    findLeadMatches()
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scans database to automatically pair Buyer ↔ Seller and Tenant ↔ Landlord leads based on location, property type, and a ±15% price margin tolerance.
                </p>
              </div>

              {/* REAL APP MATCHESCLIENT UI MOCKUP (RESPONSIVE NON-OVERLAY BADGE) */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-gray-100 relative overflow-hidden">
                <div className="mb-3 text-center">
                  <span className="inline-block bg-amber-50 text-amber-800 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs leading-tight">
                    ✨ Location + Property Type + Price (15% margin)
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-2.5 sm:gap-4">
                  {/* Lead 1: Buyer */}
                  <div className="flex-1 bg-gray-50/80 rounded-xl p-3 border border-transparent hover:border-blue-100 transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1">BUYER</span>
                    <h4 className="font-bold text-gray-900 text-xs">Abdullah Hassan</h4>
                    <p className="text-xs text-gray-500">DHA Phase 6 • 1 Kanal</p>
                    <p className="text-xs font-bold text-gray-900 mt-1.5">PKR 45,000,000</p>
                  </div>

                  {/* Lead 2: Seller */}
                  <div className="flex-1 bg-gray-50/80 rounded-xl p-3 text-left sm:text-right border border-transparent hover:border-purple-100 transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block mb-1">SELLER</span>
                    <h4 className="font-bold text-gray-900 text-xs">Mudassar Awan</h4>
                    <p className="text-xs text-gray-500">DHA Phase 6 • 1 Kanal</p>
                    <p className="text-xs font-bold text-gray-900 mt-1.5">PKR 46,500,000</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <div className="flex-1 bg-gray-900 text-white text-xs font-bold py-2.5 min-h-[44px] flex items-center justify-center rounded-xl text-center cursor-pointer active:scale-95 transition-transform">Call Abdullah</div>
                  <div className="flex-1 bg-gray-900 text-white text-xs font-bold py-2.5 min-h-[44px] flex items-center justify-center rounded-xl text-center cursor-pointer active:scale-95 transition-transform">Call Mudassar</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hub' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">📱 Centralized Lead Hub & Dual Logging</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Static sticky notes for remarks + chronological activity timeline logs (calls, meetings, WhatsApp notes).
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 font-bold text-gray-900">
                  <span>Lead Detail: Gulberg Commercial Plot</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">NEW</span>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">📌 Sticky Notes</p>
                  <p className="text-gray-700 font-medium leading-relaxed">Looking for main road plot, basement required, cash client ready to advance.</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">📜 Activity Timeline Logs</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-gray-600 text-xs gap-1">
                    <span>📞 <strong>Call Completed:</strong> Scheduled site visit</span>
                    <span className="text-gray-400 text-[10px]">Today, 09:15 AM</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-gray-600 text-xs gap-1">
                    <span>💬 <strong>WhatsApp Sent:</strong> Property brochure PDF dispatched</span>
                    <span className="text-gray-400 text-[10px]">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">🟢 Automated Lead Health Scoring Engine</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculates staleness from <code>lastContacted</code> date to flag cooling leads with visual health indicators.
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 truncate">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-xs shrink-0"></div>
                    <span className="truncate">Kashan Haider (2d ago)</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 shrink-0">
                    Healthy (100%)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 truncate">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white shadow-xs shrink-0"></div>
                    <span className="truncate">Usman Tariq (10d ago)</span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 shrink-0">
                    Warning (50%)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 truncate">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white shadow-xs animate-pulse shrink-0"></div>
                    <span className="truncate">Bilal Ahmad (18d ago)</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 shrink-0">
                    Critical (5%)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 mt-3">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Overall Lead Health Bar</span>
                    <span className="font-bold text-green-600 text-xs">Healthy (75%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">📋 Touch-Optimized Kanban Pipeline</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mobile drag-and-drop pipeline stages with optimistic state updates and fallback quick-move dropdowns.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="bg-gray-200/50 p-2 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-gray-900 text-[10px]">New Leads</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">2</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-2xs font-bold text-gray-900 text-[10px]">
                    Bahria Town Buyer
                    <div className="text-[9px] text-gray-500 mt-1 font-normal">PKR 3.5 Crore</div>
                  </div>
                </div>

                <div className="bg-gray-200/50 p-2 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-gray-900 text-[10px]">Contacted</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">1</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-2xs font-bold text-gray-900 text-[10px]">
                    Gulberg Office
                  </div>
                </div>

                <div className="bg-gray-200/50 p-2 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-gray-900 text-[10px]">Interested</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800">3</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-2xs font-bold text-gray-900 text-[10px]">
                    DHA Phase 5 House
                  </div>
                </div>

                <div className="bg-gray-200/50 p-2 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-gray-900 text-[10px]">Negotiation</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">1</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-2xs font-bold text-gray-900 text-[10px]">
                    Johar Commercial
                  </div>
                </div>

                <div className="bg-gray-200/50 p-2 rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-gray-900 text-[10px]">Closed (Won)</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">4</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-2xs font-bold text-gray-900 text-[10px]">
                    Model Town Villa
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">🏷️ South Asian Lakh & Crore Pricing Engine</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prevents critical data entry mistakes on high-value real estate listings via live calculation functions.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Interactive Price Input (PKR):</label>
                  <input
                    type="text"
                    value={demoPriceInput}
                    onChange={(e) => setDemoPriceInput(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-mono font-bold focus:ring-2 focus:ring-black outline-none min-h-[44px]"
                    placeholder="Enter digits (e.g. 45000000)"
                  />
                </div>

                <div className="flex justify-between items-center font-bold bg-white p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-600">Formatted Price Display:</span>
                  <span className="text-gray-900 font-extrabold text-sm sm:text-base">
                    {formatIndianNumber(demoPriceInput) || '0'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Words Output:</p>
                  <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
                    {numberToWordsIndian(demoPriceInput) || 'Enter amount'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECONDARY SHOWCASE: INVOICING, AUTOMATIONS & TECH */}
      <section className="px-4 py-10 max-w-4xl mx-auto border-t border-gray-200 mt-6">
        <div className="text-center mb-8">
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
            Infrastructure & Automations
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            Invoicing, Automations & Tech Stack
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base mb-2">
              📄
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">In-Browser PDF Invoices</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dynamically renders client-side commission receipt PDFs using <code>@react-pdf/renderer</code> with agency logo branding.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base mb-2">
              🌅
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">8:00 AM Daily Briefings</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vercel Cron dispatches automated morning itinerary briefing emails and follow-up reminders via Nodemailer.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base mb-2">
              🔒
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">Closed-Pilot Security</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              NextAuth.js v5 session security with Google OAuth interceptors mapping string IDs to strict PostgreSQL UUIDs.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="px-4 py-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 text-center text-white shadow-xl">
          <h2 className="text-xl sm:text-2xl font-black mb-2">
            Accelerate Your Real Estate Sales Cycle
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mb-5 font-medium">
            Launch the live CRM dashboard or explore with a pre-configured sandbox demo account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2.5">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 min-h-[48px] rounded-xl shadow-md active:scale-95 transition flex items-center justify-center"
            >
              Launch CRM Dashboard
            </Link>
            <Link
              href="/login?demo=true"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 min-h-[48px] rounded-xl backdrop-blur-md active:scale-95 transition flex items-center justify-center"
            >
              🔑 Sandbox Demo Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 pt-6 max-w-4xl mx-auto border-t border-gray-200 text-center text-xs text-gray-500 space-y-1.5">
        <p className="font-extrabold text-gray-800 text-sm">EstatePulse — Mobile-First Real Estate SaaS</p>
        <p className="text-xs text-gray-600 font-medium">
          Showcased by{' '}
          <a 
            href="https://elevon-core.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-bold text-blue-600 hover:underline"
          >
            Elevon Core
          </a>
          {' '}— Our organization showcasing projects built as a team.
        </p>
        <p className="text-xs text-gray-500">
          Contact: <a href="mailto:elevoncore@gmail.com" className="font-bold text-gray-700 hover:text-black underline">elevoncore@gmail.com</a>
        </p>
        <p className="text-[10px] text-gray-400 pt-1">© 2026 Elevon Core. All rights reserved.</p>
      </footer>
    </div>
  );
}
