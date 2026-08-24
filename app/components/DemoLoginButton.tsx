'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateDemoSignInUrl } from '../lib/auth-actions';

interface DemoLoginButtonProps {
  className?: string;
  label?: string;
}

export default function DemoLoginButton({ className, label }: DemoLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      const url = await getOrCreateDemoSignInUrl();
      router.push(url);
    } catch (err) {
      console.error('Failed to launch demo session:', err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDemoLogin}
      disabled={loading}
      className={
        className ||
        'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-98 transition-all disabled:opacity-75 cursor-pointer'
      }
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Launching Demo Sandbox...</span>
        </>
      ) : (
        <>
          <span className="text-base">⚡</span>
          <span>{label || 'Instant 1-Click Demo Account'}</span>
          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">No Sign-up</span>
        </>
      )}
    </button>
  );
}
