'use client';

import { useActionState } from 'react';
import { register, authenticateGoogle } from '../lib/auth-actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, dispatch, isPending] = useActionState(register, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-600 mt-2">Start your 14-day free trial</p>
        </div>
        
        <form action={dispatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="Ali Khan" 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-400 text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agency Name</label>
            <input 
              name="agencyName" 
              type="text" 
              required /* <-- Added this so it cannot be skipped */
              placeholder="Khan Estate" 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-400 text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="ali@khanestate.com" 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-400 text-gray-900" 
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
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-400 text-gray-900" 
            />
          </div>
          
          {state && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
              ⚠️ {state}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isPending} 
            className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isPending ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Or
          </div>
        </div>

        <form action={authenticateGoogle} className="mt-4">
          <button type="submit" className="w-full flex justify-center items-center gap-2 py-3.5 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign up with Google
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="font-bold text-black hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}