'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // --- UX: Close on Click Outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LOGIC: Group Critical vs Reminders ---
  const criticalItems = reminders.filter(r => r.type === 'critical');
  const reminderItems = reminders.filter(r => r.type !== 'critical');

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleNavigate = (id: string | number) => {
    setIsOpen(false);
    router.push(`/leads/${id}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      
      {/* 1. THE TRIGGER BUTTON (Bell) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-blue-50 text-blue-600 shadow-inner' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
        
        {/* Badge Logic */}
        {reminders.length > 0 && (
          <span className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white ${criticalItems.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
        )}
      </button>

      {/* 2. THE DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in zoom-in-95 origin-top-right">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
            <h3 className="font-extrabold text-gray-900 text-sm tracking-wide">Notifications</h3>
            {reminders.length > 0 && (
              <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{reminders.length} New</span>
            )}
          </div>

          {/* Scrollable List */}
          <div className="max-h-[65vh] overflow-y-auto p-2 space-y-4">
            
            {reminders.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center opacity-50">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-3xl">✨</div>
                <p className="text-sm font-bold text-gray-900">All caught up!</p>
                <p className="text-xs text-gray-500">No pending tasks for today.</p>
              </div>
            ) : (
              <>
                {/* SECTION A: CRITICAL ALERTS */}
                {criticalItems.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 mt-2">Attention Required</p>
                    {criticalItems.map((r, i) => (
                      <div key={r.id} onClick={() => handleNavigate(r.id)} className="group cursor-pointer p-3 rounded-xl bg-red-50/80 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{r.name}</h4>
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          </div>
                          <p className="text-xs text-red-700 font-medium mt-0.5">Inactive for {r.daysAgo} days</p>
                          <p className="text-[10px] text-red-400 mt-1">Health Score Critical</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION B: REMINDERS */}
                {reminderItems.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">Upcoming & Overdue</p>
                    {reminderItems.map((r, i) => {
                      const isOverdue = r.type === 'overdue';
                      return (
                        <div key={r.id} onClick={() => handleNavigate(r.id)} className="group cursor-pointer p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex gap-3 items-start">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isOverdue ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{r.name}</h4>
                            <p className={`text-xs font-medium mt-0.5 ${isOverdue ? 'text-amber-600' : 'text-blue-600'}`}>
                              {isOverdue ? 'Overdue: ' : 'Due: '} {formatDate(r.date)}
                            </p>
                          </div>
                          <div className="text-gray-300 group-hover:text-gray-500 transition-colors self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Footer Actions (Mark all read placeholder) */}
          <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
             <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider py-1">Close Notifications</button>
          </div>

        </div>
      )}
    </div>
  );
}