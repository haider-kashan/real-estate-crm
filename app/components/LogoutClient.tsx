'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

export default function LogoutClient() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut({ redirectUrl: '/login' });
  }, [signOut]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
      <div className="animate-pulse text-sm text-[#888888]">
        Signing out...
      </div>
    </div>
  );
}
