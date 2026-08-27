'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DemoLoginButton from './DemoLoginButton';

export type FeatureTabId = 
  | 'matching' 
  | 'hub' 
  | 'health' 
  | 'pipeline' 
  | 'pricing' 
  | 'reminders' 
  | 'briefings' 
  | 'analytics' 
  | 'invoicing';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<FeatureTabId>('matching');
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

  // Complete List of 9 Lead Retention & CRM Features
  const tabsList: Array<{ id: FeatureTabId; label: string; shortLabel: string; category: string }> = [
    { id: 'matching', label: '✨ Algorithmic Matching', shortLabel: '✨ Matching', category: 'Core' },
    { id: 'hub', label: '📱 Lead Hub & Logs', shortLabel: '📱 Lead Hub', category: 'Core' },
    { id: 'health', label: '🟢 Health Scoring', shortLabel: '🟢 Health Score', category: 'Retention' },
    { id: 'reminders', label: '⏰ Follow-Up Reminders', shortLabel: '⏰ Follow-Ups', category: 'Retention' },
    { id: 'briefings', label: '📬 Morning Briefings', shortLabel: '📬 Briefings', category: 'Automation' },
    { id: 'pipeline', label: '📋 Touch Pipeline', shortLabel: '📋 Pipeline', category: 'Pipeline' },
    { id: 'analytics', label: '📊 Lead Analytics', shortLabel: '📊 Analytics', category: 'Intelligence' },
    { id: 'pricing', label: '🏷️ Lakh / Crore Engine', shortLabel: '🏷️ Price Engine', category: 'Tools' },
    { id: 'invoicing', label: '📄 Client PDF Invoices', shortLabel: '📄 Invoices', category: 'Financials' },
  ];

  const currentTabIndex = tabsList.findIndex((t) => t.id === activeTab);

  const goToPrevTab = () => {
    const prevIndex = (currentTabIndex - 1 + tabsList.length) % tabsList.length;
    setActiveTab(tabsList[prevIndex].id);
  };

  const goToNextTab = () => {
    const nextIndex = (currentTabIndex + 1) % tabsList.length;
    setActiveTab(tabsList[nextIndex].id);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      
      {/* REAL APP HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-3 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* HERO SECTION WITH 2-COLUMN SPLIT LAYOUT */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-14 sm:pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* LEFT COLUMN: Written Content & Action Buttons */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left">
            {/* Pilot Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Lead Retention & Real Estate SaaS</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[44px] xl:text-5xl font-black tracking-tight text-gray-900 leading-[1.12] mb-4">
              Never Lose a Lead Again with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Proactive Retention Controls
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed font-medium max-w-xl">
              Centralize client leads, auto-match Buyers with Sellers, monitor lead health staleness, trigger morning briefings, and enforce follow-up itineraries—built 100% for mobile speed.
            </p>

            {/* Action Buttons (Black Sign Up + Orange Demo Button) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto text-sm font-bold bg-gray-900 hover:bg-black text-white px-6 py-3.5 min-h-[48px] rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Sign Up Free</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-extrabold uppercase">Pilot</span>
              </Link>
              <DemoLoginButton 
                label="Explore Demo Sandbox"
                wrapperClassName="w-full sm:w-auto"
                className="w-full sm:w-auto text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 px-6 py-3.5 min-h-[48px] rounded-xl shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              />
            </div>

            {/* Micro-Features / Trust Signals */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100 w-full">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instant 1-Click Demo
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Zero Credit Card Required
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Mobile Optimized CRM
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Real App UI Mockup ("The Picture") */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-gray-200/90 text-left overflow-hidden ring-1 ring-black/5">
              
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
          </div>

        </div>
      </section>

      {/* CORE REAL ESTATE LEAD RETENTION FEATURE SHOWCASE */}
      <section className="px-3 py-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Proactive Lead Retention Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-1">
            Real App Features & Retention Tools
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">
            Explore all 9 built-in lead retention features, workflow engines, and automated alerts.
          </p>
        </div>

        {/* RESPONSIVE 9-TAB NAVIGATION GRID — 100% VISIBLE ON MOBILE & DESKTOP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center gap-2 mb-6 text-xs font-bold">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 min-h-[44px] text-center active:scale-95 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10 ring-2 ring-gray-900 font-extrabold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* FEATURE SHOWCASE CARD WITH SUB-NAVIGATION FOOTER */}
        <div className="bg-white rounded-3xl p-4 sm:p-7 border border-gray-200 shadow-md transition-all duration-200">
          
          {/* TAB 1: ALGORITHMIC MATCHING */}
          {activeTab === 'matching' && (
            <div className="space-y-4 animate-in fade-in duration-200">
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

              {/* REAL APP MATCHESCLIENT UI MOCKUP */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-gray-100 relative overflow-hidden">
                <div className="mb-3 text-center">
                  <span className="inline-block bg-amber-50 text-amber-800 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs leading-tight">
                    ✨ Location + Property Type + Price (15% margin)
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-2.5 sm:gap-4">
                  <div className="flex-1 bg-gray-50/80 rounded-xl p-3 border border-transparent hover:border-blue-100 transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1">BUYER</span>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Abdullah Hassan</h4>
                    <p className="text-xs text-gray-500">DHA Phase 6 • 1 Kanal</p>
                    <p className="text-xs font-bold text-gray-900 mt-1.5">PKR 45,000,000</p>
                  </div>

                  <div className="flex-1 bg-gray-50/80 rounded-xl p-3 text-left sm:text-right border border-transparent hover:border-purple-100 transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block mb-1">SELLER</span>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Mudassar Awan</h4>
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

          {/* TAB 2: CENTRALIZED LEAD HUB */}
          {activeTab === 'hub' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">📱 Centralized Lead Hub & Dual Logging</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Static sticky notes for remarks + chronological activity timeline logs (calls, meetings, WhatsApp notes).
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 font-bold text-gray-900">
                  <span className="text-xs sm:text-sm">Lead Detail: Gulberg Commercial Plot</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-100 text-green-700 uppercase">NEW</span>
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

          {/* TAB 3: LEAD HEALTH SCORING */}
          {activeTab === 'health' && (
            <div className="space-y-4 animate-in fade-in duration-200">
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

                <div className="bg-white p-3.5 rounded-xl border border-gray-200 mt-3">
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

          {/* TAB 4: SMART FOLLOW-UP & OVERDUE TASK MANAGER */}
          {activeTab === 'reminders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>⏰ Smart Follow-Up & Overdue Task Manager</span>
                  <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100 font-extrabold">
                    Retention Task Tracker
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dedicated itinerary dashboard (`/dashboard/follow-ups`) flagging Overdue vs. Upcoming tasks with quick-date reschedulers and Mark Done triggers.
                </p>
              </div>

              {/* REAL APP FOLLOWUPSCLIENT MOCKUP */}
              <div className="space-y-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 relative overflow-hidden text-xs">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                  <div className="pl-2 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Zubair Khan</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">BUYER • CONTACTED</p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">DHA Phase 5 • PKR 5.5 Crore</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">Overdue</span>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Yesterday</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 pt-2 border-t border-red-100">
                    <button className="flex-1 bg-gray-900 text-white font-bold py-2 rounded-lg text-center text-xs">Call Now</button>
                    <button className="flex-1 bg-white border border-gray-200 font-bold text-gray-700 py-2 rounded-lg text-center text-xs">Mark Done</button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-white relative overflow-hidden text-xs">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <div className="pl-2 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Farhan Ali</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">SELLER • INTERESTED</p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">Johar Town • PKR 2.8 Crore</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">Upcoming</span>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Today, 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTOMATED MORNING BRIEFINGS */}
          {activeTab === 'briefings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>📬 Automated Morning Retention Briefings</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-extrabold">
                    8:00 AM Vercel Cron
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Serverless Cron workflows dispatching daily 8:00 AM email digests with scheduled itineraries, cooling lead retention alerts, and new buyer/seller matches.
                </p>
              </div>

              {/* AUTOMATED BRIEFING EMAIL MOCKUP */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📬</span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">Daily Briefing — 8:00 AM Digest</h4>
                      <p className="text-[10px] text-slate-400">Dispatched via Nodemailer cron engine</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">AUTOMATED</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="font-medium text-slate-200">Good morning, Agent! Here is your lead retention overview for today:</p>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-300 text-[11px]">
                    <li><strong className="text-white">3 Follow-Ups Scheduled:</strong> Zubair Khan, Farhan Ali, Imran Shah</li>
                    <li><strong className="text-amber-400">2 Cooling Leads (Action Required):</strong> Bilal Ahmad (18d without contact)</li>
                    <li><strong className="text-emerald-400">1 New Algorithmic Match:</strong> DHA Phase 6 Buyer ↔ Seller Pair</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TOUCH KANBAN PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4 animate-in fade-in duration-200">
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

          {/* TAB 7: LEAD ANALYTICS & EVENT TRACKING */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>📊 Lead Retention Analytics & Activity Event Tracking</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100 font-extrabold">
                    Prisma AnalyticsEvent
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tracks agent outreach and lead engagement metrics (`click_call`, `click_whatsapp`, `mark_contacted`, `set_reminder`) to measure conversion velocity.
                </p>
              </div>

              {/* ANALYTICS METRICS CARDS MOCKUP */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Call Triggers</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-0.5">142</p>
                  <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+18% this month</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp Outreaches</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-0.5">289</p>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+34% this month</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Lead Retention Rate</p>
                  <p className="text-lg font-extrabold text-blue-600 mt-0.5">92.4%</p>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">High Conversion</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LAKH & CRORE PRICING ENGINE */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-in fade-in duration-200">
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

          {/* TAB 9: CLIENT PDF INVOICING */}
          {activeTab === 'invoicing' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>📄 Client PDF Invoicing & Financial Logs</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-extrabold">
                    @react-pdf/renderer
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generates branded client commission receipt PDFs directly in the browser with Optimistic UI status updates (`Pending` ↔ `Paid`).
                </p>
              </div>

              {/* INVOICE CARD MOCKUP */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Invoice #INV-2026-08</span>
                    <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm mt-0.5">Commission Receipt — DHA Plot Deal</h4>
                    <p className="text-[11px] font-bold text-blue-600 mt-1">PKR 900,000 (Nine Lakh Only)</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">PAID</span>
                    <button className="block text-[10px] font-bold text-gray-900 underline mt-2">Download PDF 📄</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IN-CARD SUB-NAVIGATION FOOTER (STEP PREVIOUS / NEXT FEATURE) */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
            <button
              onClick={goToPrevTab}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 min-h-[40px] transition active:scale-95 border border-gray-200"
            >
              <span>←</span>
              <span>Previous</span>
            </button>

            <span className="text-[11px] font-extrabold text-gray-400">
              Feature {currentTabIndex + 1} of {tabsList.length}
            </span>

            <button
              onClick={goToNextTab}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white min-h-[40px] transition active:scale-95 shadow-xs"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </section>

      {/* SECONDARY SHOWCASE: HIGH-PERFORMANCE TECH & ARCHITECTURE (NO REPETITION OF TAB FEATURES) */}
      <section className="px-4 py-10 max-w-4xl mx-auto border-t border-gray-200 mt-6">
        <div className="text-center mb-8">
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
            Engineering & Infrastructure
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            Next.js App Router Architecture & Security
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base mb-2">
              ⚡
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">Optimistic UI State Actions</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Instant UI re-renders backed by Next.js Server Actions mutating PostgreSQL in the background.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base mb-2">
              🐘
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">Supabase & Prisma ORM</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Strict schema definitions with high-performance indexes on lead status, types, and analytics logs.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base mb-2">
              🔒
            </div>
            <h3 className="font-bold text-gray-900 text-xs mb-1">NextAuth v5 Security</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Google OAuth interceptors mapping string IDs to strict PostgreSQL UUIDs with dynamic host headers.
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
            <DemoLoginButton
              label="Explore Demo Sandbox"
              wrapperClassName="w-full sm:w-auto"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 min-h-[48px] rounded-xl backdrop-blur-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            />
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
