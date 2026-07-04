'use client';

import { useActionState, useEffect } from 'react';
import { verifyEmail } from '../lib/auth-actions';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const [state, dispatch, isPending] = useActionState(verifyEmail, undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (state === 'success') router.push('/login?verified=true');
  }, [state, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">Check Your Email</h1>
          <p className="text-sm text-gray-600 mt-2">
            We sent a 6-digit code to <span className="font-bold">{email}</span>
          </p>
        </div>
        
        <form action={dispatch} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Verification Code</label>
            <input 
              name="code" 
              type="text" 
              required 
              maxLength={6}
              placeholder="123456" 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center tracking-[0.5em] text-lg font-bold text-gray-900" 
            />
          </div>
          
          {state && state !== 'success' && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
              ⚠️ {state}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isPending} 
            className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isPending ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}