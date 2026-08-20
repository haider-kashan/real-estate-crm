'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. VISIBILITY LOGIC
  // Hide only if 'adding' mode is active (URL contains ?adding=true)
  const isAdding = searchParams.get('adding') === 'true';
  
  if (isAdding) {
    return null;
  }

  // Helper to check active state
  const isActive = (path: string) => {
    if ((path === '/dashboard' || path === '/') && (pathname === '/dashboard' || pathname === '/')) return true;
    if (path !== '/' && path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  // Common transition classes for smooth animation
  const navItemClass = "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300 group min-w-0";
  const iconBaseClass = "p-1.5 px-2.5 sm:px-4 rounded-full transition-all duration-300 flex items-center justify-center";
  const labelClass = "text-[10px] sm:text-[11px] font-bold transition-colors duration-300 tracking-tight truncate max-w-full";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-between items-center px-1 sm:px-4 pb-safe pt-2 h-[80px] z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.03)]">
      
      {/* 1. ALL (Home) */}
      <Link href="/dashboard" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/dashboard') ? 'bg-gray-900 text-white shadow-md translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-gray-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <span className={`${labelClass} ${isActive('/dashboard') ? 'text-gray-900' : 'text-gray-400'}`}>
          Dashboard
        </span>
      </Link>

      {/* 2. SALES */}
      <Link href="/sales" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/sales') ? 'bg-blue-600 text-white shadow-md shadow-blue-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-blue-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <span className={`${labelClass} ${isActive('/sales') ? 'text-blue-600' : 'text-gray-400'}`}>
          Sales
        </span>
      </Link>

      {/* 3. RENTALS */}
      <Link href="/rentals" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/rentals') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-indigo-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <span className={`${labelClass} ${isActive('/rentals') ? 'text-indigo-600' : 'text-gray-400'}`}>
          Rentals
        </span>
      </Link>
      
      {/* 4. PIPELINE (KANBAN) */}
      <Link href="/dashboard/pipeline" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/dashboard/pipeline') ? 'bg-orange-500 text-white shadow-md shadow-orange-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-orange-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
        </div>
        <span className={`${labelClass} ${isActive('/dashboard/pipeline') ? 'text-orange-500' : 'text-gray-400'}`}>
          Pipeline
        </span>
      </Link>

      {/* 5. FOLLOW-UPS */}
      <Link href="/dashboard/follow-ups" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/dashboard/follow-ups') ? 'bg-red-500 text-white shadow-md shadow-red-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-red-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <span className={`${labelClass} ${isActive('/dashboard/follow-ups') ? 'text-red-500' : 'text-gray-400'}`}>
          Tasks
        </span>
      </Link>

      {/* 6. SMART MATCHES */}
      <Link href="/dashboard/matches" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/dashboard/matches') ? 'bg-amber-500 text-white shadow-md shadow-amber-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-amber-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
        </div>
        <span className={`${labelClass} ${isActive('/dashboard/matches') ? 'text-amber-500' : 'text-gray-400'}`}>
          Matches
        </span>
      </Link>
      
    </div>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}