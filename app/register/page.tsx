'use client';

import { useActionState } from 'react';
import { register } from '../lib/auth-actions';
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
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="font-bold text-black hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}