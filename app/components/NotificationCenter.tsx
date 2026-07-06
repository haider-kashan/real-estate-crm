'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface ReminderItem {
  id: string | number;
  name: string;
  phone: string;
  type: 'overdue' | 'today' | 'critical';
  daysAgo?: number;
  date?: string;
}

interface NotificationCenterProps {
  reminders: ReminderItem[];
}

export default function NotificationCenter({ reminders }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // --- UX: Lock Body Scroll & Handle 'Escape' Key ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // --- LOGIC: Group Critical vs Reminders ---
  const criticalItems = reminders.filter(r => r.type === 'critical');
  const reminderItems = reminders.filter(r => r.type !== 'critical');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleNavigate = (id: string | number) => {
    setIsOpen(false);
    router.push(`/leads/${id}`);
  };

  return (
    <>
      {/* 1. THE TRIGGER BUTTON (Bell) */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        
        {/* Badge */}
        {reminders.length > 0 && (
          <span className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white ${criticalItems.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
        )}
      </button>

      {/* 2. THE SLIDE-OUT DRAWER OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          
          {/* Dark blurred backdrop (clicking it closes the drawer) */}
          <div 
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)}
          ></div>

          {/* The Actual Drawer Panel */}
          <div className="relative w-full sm:w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-gray-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-gray-900">Notifications</h2>
                {reminders.length > 0 && (
                  <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{reminders.length}</span>
                )}
              </div>
              
              {/* Close 'X' Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
              
              {reminders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-60 pb-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">🎉</div>
                  <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                  <p className="text-sm text-gray-500 mt-1">You have no pending tasks today.</p>
                </div>
              ) : (
                <div className="space-y-6 pb-8">
                  
                  {/* SECTION A: CRITICAL ALERTS */}
                  {criticalItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-red-500 uppercase tracking-widest pl-1 mb-3">Action Required</h4>
                      {criticalItems.map((r) => (
                        <div key={r.id} onClick={() => handleNavigate(r.id)} className="group cursor-pointer p-4 rounded-2xl bg-white hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all shadow-sm hover:shadow flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-gray-900 text-base truncate">{r.name}</h4>
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            </div>
                            <p className="text-sm text-red-700 font-medium mt-1">Inactive for {r.daysAgo} days</p>
                            <p className="text-xs text-gray-500 mt-1">Lead health is dropping. Follow up immediately.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SECTION B: REMINDERS */}
                  {reminderItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 mb-3">Upcoming & Overdue</h4>
                      {reminderItems.map((r) => {
                        const isOverdue = r.type === 'overdue';
                        return (
                          <div key={r.id} onClick={() => handleNavigate(r.id)} className="group cursor-pointer p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow flex gap-4 items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h4 className="font-bold text-gray-900 text-base truncate">{r.name}</h4>
                              <p className={`text-sm font-medium mt-1 ${isOverdue ? 'text-amber-600' : 'text-blue-600'}`}>
                                {isOverdue ? 'Overdue: ' : 'Due: '} {formatDate(r.date)}
                              </p>
                            </div>
                            <div className="text-gray-300 group-hover:text-black transition-colors self-center pr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}