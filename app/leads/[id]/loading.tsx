import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-40 relative animate-pulse">
      
      {/* HEADER SKELETON */}
      <header className="px-4 py-3 text-white sticky top-0 z-20 flex items-center shadow-md bg-gray-300">
        <div className="mr-3 w-10 h-10 bg-white/20 rounded-full"></div>
        <div className="flex-1">
          <div className="w-32 h-5 bg-white/30 rounded mb-2"></div>
          <div className="w-20 h-3 bg-white/20 rounded"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
        </div>
      </header>

      {/* MAIN CONTENT SKELETON */}
      <div className="p-4 space-y-4">
        
        {/* HEALTH CARD SKELETON */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-2">
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
                <div className="w-12 h-3 bg-gray-200 rounded"></div>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2 mb-3"></div>
             <div className="flex justify-between items-center">
                <div className="w-32 h-3 bg-gray-200 rounded"></div>
                <div className="w-24 h-8 bg-gray-100 rounded-lg"></div>
             </div>
        </div>

        {/* BUDGET & LOCATION SKELETON */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-5 border-b border-gray-50">
             <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
             <div className="w-48 h-8 bg-gray-200 rounded"></div>
             <div className="mt-3 flex items-start gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full mt-0.5"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
             </div>
           </div>
           <div className="grid grid-cols-2 divide-x divide-gray-50 bg-gray-50/50">
              <div className="p-4 flex flex-col items-center">
                 <div className="w-20 h-3 bg-gray-200 rounded mb-2"></div>
                 <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="p-4 flex flex-col items-center">
                 <div className="w-10 h-3 bg-gray-200 rounded mb-2"></div>
                 <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
           </div>
        </div>

        {/* SPECIFICATIONS SKELETON */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-24 h-4 bg-gray-200 rounded mb-4"></div>
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                 <div className="w-12 h-3 bg-gray-200 rounded mb-2"></div>
                 <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                 <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                 <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                 <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                 <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
           </div>
        </div>

        {/* STICKY NOTES SKELETON */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-24 h-4 bg-gray-200 rounded mb-4"></div>
           <div className="w-full h-24 bg-yellow-50 rounded-xl border border-yellow-100"></div>
        </div>
      </div>

      {/* FIXED ACTION BAR SKELETON */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-40 pb-6 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

    </div>
  );
}