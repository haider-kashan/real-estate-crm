'use client';

import { useActionState, useEffect, useState } from 'react';
import { verifyEmail, resendVerificationCode } from '../lib/auth-actions'; // IMPORT THE NEW ACTION
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyForm() {
  const [state, dispatch, isPending] = useActionState(verifyEmail, undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  // State to manage the resend button feedback
  const [resendStatus, setResendStatus] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (state === 'success') router.push('/login?verified=true');
  }, [state, router]);

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    const result = await resendVerificationCode(email);
    
    if (result.error) {
      setResendStatus({ message: result.error, type: 'error' });
    } else if (result.success) {
      setResendStatus({ message: result.success, type: 'success' });
    }
    setIsResending(false);
  };

  return (
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

      {/* NEW RESEND SECTION */}
      <div className="mt-6 border-t border-gray-100 pt-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code or it expired?</p>
        <button 
          onClick={handleResend}
          disabled={isResending}
          className="text-sm font-bold text-black hover:underline disabled:opacity-50"
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </button>
        
        {resendStatus && (
          <p className={`mt-2 text-xs font-medium ${resendStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {resendStatus.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}