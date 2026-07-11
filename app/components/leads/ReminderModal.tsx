'use client';

import React, { useState } from 'react';

// 1. Updated interface to match parent props exactly
interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFollowUp: string | null | undefined;
  onSet: (isoDate: string) => void;    // Renamed from onSetReminder
  onRemove: () => void;                // Renamed from onRemoveReminder
}

// 2. Updated the destructured props here
export default function ReminderModal({ 
  isOpen, 
  onClose, 
  currentFollowUp, 
  onSet, 
  onRemove 
}: ReminderModalProps) {
  
  const [customDate, setCustomDate] = useState<string>('');

  if (!isOpen) return null;

  const handleSet = (offsetDays: number | 'custom', customDateVal?: string) => {
    let date = new Date();
    
    if (typeof offsetDays === 'number') {
      date.setDate(date.getDate() + offsetDays);
      date.setHours(10, 0, 0, 0); // Default to 10 AM
    } else if (customDateVal) {
      if (!customDateVal) return; // Quick safeguard
      date = new Date(customDateVal);
    }

    // 3. Call the newly named prop
    onSet(date.toISOString());
    onClose();
  };

  const handleRemove = () => {
    // 4. Call the newly named prop
    onRemove();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-gray-100">
        
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Set Follow-Up</h3>
          <button onClick={onClose} className="bg-white p-1 rounded-full border border-gray-200 text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          
          {/* Presets Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSet(1)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group shadow-sm">
              <span className="text-2xl">🌅</span>
              <span className="font-bold text-gray-900 text-sm">Tomorrow</span>
              <span className="text-[10px] text-gray-500 font-medium">10:00 AM</span>
            </button>
            <button onClick={() => handleSet(3)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group shadow-sm">
              <span className="text-2xl">📅</span>
              <span className="font-bold text-gray-900 text-sm">3 Days</span>
              <span className="text-[10px] text-gray-500 font-medium">Follow-up</span>
            </button>
            <button onClick={() => handleSet(7)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group shadow-sm">
              <span className="text-2xl">🗓️</span>
              <span className="font-bold text-gray-900 text-sm">Next Week</span>
              <span className="text-[10px] text-gray-500 font-medium">Long term</span>
            </button>
            <div className="flex flex-col gap-1 col-span-2 mt-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Custom Date & Time</label>
                <div className="flex gap-2">
                  <input type="datetime-local" className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer" 
                    onChange={(e) => setCustomDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker();
                      } catch (err) {}
                    }}
                  />
                  {customDate && (
                    <button 
                      onClick={() => handleSet('custom', customDate)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Confirm
                    </button>
                  )}
                </div>
            </div>
          </div>

          {/* REMOVE BUTTON */}
          {currentFollowUp && (
            <button 
              onClick={handleRemove}
              className="w-full py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Remove Reminder
            </button>
          )}

        </div>
      </div>
    </div>
  );
}