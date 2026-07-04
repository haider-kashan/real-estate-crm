'use client';

import { useActionState, useEffect, Suspense } from 'react';
import { resetPassword } from '../lib/auth-actions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const [state, dispatch, isPending] = useActionState(resetPassword, undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    // If successful, send them back to login with a success message!
    if (state === 'success') router.push('/login?reset=true');
  }, [state, router]);

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-gray-900">Set New Password</h1>
        <p className="text-sm text-gray-600 mt-2">
          We sent a 6-digit code to <span className="font-bold">{email}</span>
        </p>
      </div>
      
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reset Code</label>
          <input 
            name="code" 
            type="text" 
            required 
            maxLength={6}
            placeholder="123456" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center tracking-[0.5em] text-lg font-bold text-gray-900" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
          <input 
            name="newPassword" 
            type="password" 
            required 
            minLength={6}
            placeholder="••••••••" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900" 
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
          {isPending ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}