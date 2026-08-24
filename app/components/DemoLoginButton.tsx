'use client';

import React, { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface DemoLoginButtonProps {
  className?: string;
  label?: string;
}

export default function DemoLoginButton({ className, label }: DemoLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { client, setActive, signOut, user } = useClerk();
  const router = useRouter();

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. If currently signed in, sign out cleanly first
      if (user) {
        setStatusText('Switching to Demo Sandbox...');
        await signOut();
      }

      // 2. Fetch single-use rotating ticket from /api/demo-login
      setStatusText('Allocating Demo Sandbox...');
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.token) {
        throw new Error(data.error || 'No demo ticket token returned from server.');
      }

      // 3. Exchange ticket with Clerk directly
      setStatusText('Authenticating Clerk session...');
      if (!client?.signIn || !setActive) {
        throw new Error('Clerk SDK is still initializing. Please try again in 1 second.');
      }

      const signInResult = await client.signIn.create({
        strategy: 'ticket',
        ticket: data.token,
      });

      if (signInResult.status !== 'complete' || !signInResult.createdSessionId) {
        throw new Error(`Clerk authentication status is "${signInResult.status}" instead of "complete".`);
      }

      // 4. Activate session
      setStatusText('Opening CRM Dashboard...');
      await setActive({ session: signInResult.createdSessionId });

      // 5. Navigate to Dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('[Demo Login Error]:', err);
      const msg = err.message || 'An unexpected error occurred during demo sign in.';
      setErrorMessage(msg);
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
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
            <span>{statusText || 'Entering Demo Sandbox...'}</span>
          </>
        ) : (
          <>
            <span className="text-base">⚡</span>
            <span>{label || 'Instant 1-Click Demo Account'}</span>
            <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">No Sign-up</span>
          </>
        )}
      </button>

      {/* Explicit User-Visible Error Notification */}
      {errorMessage && (
        <div className="mt-2 p-2.5 w-full rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="flex-1">{errorMessage}</span>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-red-500 hover:text-red-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
