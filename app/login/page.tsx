'use client';

import { useActionState, Suspense } from 'react';
import { authenticate } from '../lib/auth-actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-600 mt-2">Sign in to manage your leads</p>
      </div>
      
      {isVerified && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg text-center shadow-sm">
          ✅ Email verified successfully! You can now log in.
        </div>
      )}
      
      <form action={dispatch} className="space-y-4">
        {/* RESTORED INPUTS WITH REQUIRED VALIDATION */}
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