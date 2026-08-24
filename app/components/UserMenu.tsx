'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';

export default function UserMenu({
  email,
  name,
  logoUrl,
}: {
  email?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="flex items-center">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-9 h-9 sm:w-10 sm:h-10 border-2 border-white shadow-md',
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label="Profile Settings"
            href="/profile"
            labelIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <UserButton.Link
            label="Analytics"
            href="/analytics"
            labelIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}