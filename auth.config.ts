import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Redirect here if not logged in
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // 1. Identify where the user is trying to go
      const isOnDashboard = nextUrl.pathname === '/'; // The Main Page
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnRegister = nextUrl.pathname.startsWith('/register');

      // 2. PROTECT THE DASHBOARD
      if (isOnDashboard) {
        if (isLoggedIn) return true; // Allowed
        return false; // Redirect to /login
      }

      // 3. REDIRECT IF ALREADY LOGGED IN
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl)); // Send to Dashboard
      }

      return true; // Allow access to other pages (like images/static)
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