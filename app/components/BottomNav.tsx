'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. VISIBILITY LOGIC
  // Hide if NOT on Dashboard ('/') 
  // OR if 'adding' mode is active (URL contains ?adding=true)
  const isAdding = searchParams.get('adding') === 'true';
  
  if (pathname !== '/' || isAdding) {
    return null;
  }

  // Helper to check active state
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Common transition classes for smooth animation
  const navItemClass = "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 group";
  const iconBaseClass = "p-1.5 px-5 rounded-full transition-all duration-300 flex items-center justify-center";
  const labelClass = "text-[10px] font-bold transition-colors duration-300";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center pb-safe pt-2 h-[80px] z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.03)]">
      
      {/* 1. ALL (Home) - ADDED PREFETCH */}
      <Link href="/" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/') ? 'bg-gray-900 text-white shadow-md translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-gray-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <span className={`${labelClass} ${isActive('/') ? 'text-gray-900' : 'text-gray-400'}`}>
          Dashboard
        </span>
      </Link>

      {/* 2. SALES - ADDED PREFETCH */}
      <Link href="/sales" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/sales') ? 'bg-blue-600 text-white shadow-md shadow-blue-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-blue-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <span className={`${labelClass} ${isActive('/sales') ? 'text-blue-600' : 'text-gray-400'}`}>
          Sales
        </span>
      </Link>

      {/* 3. RENTALS - ADDED PREFETCH */}
      <Link href="/rentals" prefetch={true} className={navItemClass}>
        <div className={`${iconBaseClass} ${isActive('/rentals') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-y-0' : 'bg-transparent text-gray-400 group-hover:bg-indigo-50 group-active:scale-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <span className={`${labelClass} ${isActive('/rentals') ? 'text-indigo-600' : 'text-gray-400'}`}>
          Rentals
        </span>
      </Link>
      
    </div>
  );
}

// Wrap in Suspense to avoid build errors with useSearchParams
export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}