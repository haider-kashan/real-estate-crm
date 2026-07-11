'use client';

import { useEffect } from 'react';
import { logout } from '../lib/auth-actions';

export default function LogoutClient() {
  useEffect(() => {
    // Automatically log out using the server action
    logout();
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
      <div className="animate-pulse text-sm text-[#888888]">
        Clearing expired session...
      </div>
    </div>
  );
}
