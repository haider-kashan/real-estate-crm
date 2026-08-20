import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Redirect here if not logged in
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const pathname = nextUrl.pathname;
      const isOnLanding = pathname === '/';
      const isOnLogin = pathname.startsWith('/login');
      const isOnRegister = pathname.startsWith('/register');
      const isProtectedRoute = 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/leads') || 
        pathname.startsWith('/analytics') || 
        pathname.startsWith('/admin') || 
        pathname.startsWith('/profile');

      // 1. If logged in and visiting Landing (/), Login, or Register -> redirect to /dashboard
      if (isLoggedIn && (isOnLanding || isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // 2. Protect dashboard and main app subroutes
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirects to /login
      }

      return true; // Allow access to public/static pages
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Keep this empty here! (Providers are in app/auth.ts)
} satisfies NextAuthConfig;