'use client';

import React, { useState } from 'react';
import { useClerk } from '@clerk/nextjs';

interface DemoLoginButtonProps {
  className?: string;
  label?: string;
}

export default function DemoLoginButton({ className, label }: DemoLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const { client, setActive, signOut, user } = useClerk();

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    // 1. If already logged in as the demo agent, redirect directly
    if (user?.primaryEmailAddress?.emailAddress === 'demo.agent@useestatepulse.com') {
      window.location.href = '/dashboard';
      return;
    }

    try {
      setLoading(true);

      // 2. If signed in as another account, sign out first
      if (user) {
        await signOut();
      }

      // 3. Fast 1-click single-use ticket exchange with Clerk
      try {
        const res = await fetch('/api/demo-login', { method: 'POST' });
        const data = await res.json();

        if (data?.token && client?.signIn && setActive) {
          const signInResult = await client.signIn.create({
            strategy: 'ticket',
            ticket: data.token,
          });

          if (signInResult.status === 'complete' && signInResult.createdSessionId) {
            await setActive({ session: signInResult.createdSessionId });
            window.location.href = '/dashboard';
            return;
          }
        }
      } catch (ticketErr) {
        console.warn('Ticket exchange fallback:', ticketErr);
      }

      // 4. Fallback: direct password factor
      if (client?.signIn && setActive) {
        let attempt = await client.signIn.create({
          identifier: 'demo.agent@useestatepulse.com',
        });

        if (attempt.status === 'needs_first_factor') {
          attempt = await attempt.attemptFirstFactor({
            strategy: 'password',
            password: 'DemoEstatePulse2026!Secure',
          });
        }

        if (attempt.status === 'complete' && attempt.createdSessionId) {
          await setActive({ session: attempt.createdSessionId });
          window.location.href = '/dashboard';
          return;
        }
      }

      // Fallback redirect
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Fast demo login error:', err);
      window.location.href = '/login';
    } finally {
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
          <span>Entering Demo Sandbox...</span>
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
