'use client';

import React from 'react';

interface LeadHealthProps {
  lastContacted?: string | Date; // Optional, defaults to now if missing
  variant?: 'badge' | 'bar';     // 'badge' for lists, 'bar' for details page
}

export default function LeadHealth({ lastContacted, variant = 'badge' }: LeadHealthProps) {
  
  // --- CALCULATION LOGIC ---
  const calculateHealth = () => {
    // Default to today if date is missing to prevent errors
    const dateStr = lastContacted || new Date().toISOString();
    const lastDate = new Date(dateStr);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return { 
        status: 'Healthy', 
        color: 'bg-green-500', 
        textColor: 'text-green-600', 
        ring: 'ring-green-100',
        percent: 100,
        isCritical: false 
      };
    }
    if (diffDays <= 14) {
      return { 
        status: 'Warning', 
        color: 'bg-orange-500', 
        textColor: 'text-orange-600', 
        ring: 'ring-orange-100', 
        percent: 50,
        isCritical: false 
      };
    }
    return { 
      status: 'Critical', 
      color: 'bg-red-500', 
      textColor: 'text-red-600', 
      ring: 'ring-red-100', 
      percent: 5,
      isCritical: true 
    };
  };

  const health = calculateHealth();

  // --- RENDER VARIANT: BADGE (For Lists/Dashboard) ---
  if (variant === 'badge') {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <div className={`w-2 h-2 rounded-full ${health.color} ${health.isCritical ? 'animate-pulse' : ''}`}></div>
        <span className={`text-[10px] font-bold ${health.textColor}`}>
          {health.isCritical ? 'Action Req.' : health.status}
        </span>
      </div>
    );
  }

  // --- RENDER VARIANT: BAR (For Details Page) ---
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health Score</span>
        <span className={`text-xs font-bold ${health.textColor}`}>{health.status}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${health.color} transition-all duration-500 ${health.isCritical ? 'animate-pulse' : ''}`} 
          style={{ width: `${health.percent}%` }}
        ></div>
      </div>
      {health.isCritical && (
        <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Lead is cold. Contact immediately to retain interest.
        </p>
      )}
    </div>
  );
}