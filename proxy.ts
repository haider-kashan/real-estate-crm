import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// ⚠️ ONLY import authConfig here. DO NOT import 'auth.ts' or 'prisma'!
export default NextAuth(authConfig).auth;

export const config = {
  // This matcher tells Next.js to run this on EVERY page except static files
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};