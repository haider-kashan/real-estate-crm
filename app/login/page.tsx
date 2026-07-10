'use client';

import { useActionState, Suspense } from 'react';
import { authenticate, createDemoAccount } from '../lib/auth-actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const isReset = searchParams.get('reset') === 'true';

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-600 mt-2">Sign in to manage your leads</p>
      </div>
      
      {(isVerified || isReset) && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg text-center shadow-sm">
          ✅ {isVerified ? 'Email verified successfully!' : 'Password reset successfully!'} You can now log in.
        </div>
      )}
      
      <form action={dispatch} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
          <input 
            name="email" 
            type="email" 
            required 
            placeholder="dealer@agency.com" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            minLength={6}
            placeholder="••••••••" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900" 
          />
        </div>

        <div className="flex justify-end mt-1">
          <Link href="/forgot-password" className="text-xs font-bold text-gray-500 hover:text-black transition-colors">
            Forgot password?
          </Link>
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
            ⚠️ {errorMessage}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isPending} 
          className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* --- NEW DEMO BUTTON SECTION --- */}
      <div className="mt-4 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Or
        </div>
      </div>

      <form action={async () => { await createDemoAccount(); }} className="mt-4">
        <button 
          type="submit" 
          className="w-full py-3.5 bg-white text-black font-bold rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/></svg>
          Try Demo Account
        </button>
      </form>
      {/* ------------------------------- */}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account? <Link href="/register" className="font-bold text-black hover:underline">Register here</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}