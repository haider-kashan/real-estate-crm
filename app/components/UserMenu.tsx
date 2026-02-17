'use client';

import { useState, useRef, useEffect } from 'react';
import { logout } from '../lib/auth-actions';
import Link from 'next/link';

// 1. Added logoUrl to the Interface
export default function UserMenu({ 
  email, 
  name, 
  logoUrl 
}: { 
  email: string; 
  name: string; 
  logoUrl?: string | null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER BUTTON (Avatar or Logo) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all border-2 border-white shadow-md overflow-hidden focus:outline-none"
      >
        {/* 2. LOGIC: Show Logo if it exists, otherwise show Initials */}
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Agency Logo" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <div className="py-1">
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              Profile Settings
            </Link>
            <Link href="/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              Analytics 📊
            </Link>
          </div>

          <div className="border-t border-gray-100 p-1">
            <form action={logout}>
              <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}