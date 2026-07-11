import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from './app/lib/prisma';
import bcrypt from 'bcryptjs';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validate the input fields
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Validation failed:', parsedCredentials.error);
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          // 2. Fetch the user directly inside the try/catch
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            console.log('Login failed: No user found with email', email);
            return null;
          }

          // 3. CHECK IF ACCOUNT IS LOCKED
          if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            throw new Error('ACCOUNT_LOCKED');
          }

          // 4. COMPARE PASSWORDS
          let passwordsMatch = false;
          if (user.isDemo && password === 'demopassword123') {
            passwordsMatch = true; // Instant login for demo
          } else {
            passwordsMatch = await bcrypt.compare(password, user.password);
          }

          // 5. IF PASSWORD FAILS, INCREMENT ATTEMPTS
          if (!passwordsMatch) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updates: any = { failedLoginAttempts: attempts };
            
            // Lock out for 15 minutes if they fail 5 times
            if (attempts >= 5) {
              updates.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); 
              console.log(`Account locked for ${email}`);
            }
            
            await prisma.user.update({ where: { email }, data: updates });
            console.log(`Login failed: Passwords do not match. Attempt ${attempts}/5`);
            return null;
          }

          // 6. IF PASSWORD SUCCEEDS, RESET COUNTERS
          if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
            await prisma.user.update({
              where: { email },
              data: { failedLoginAttempts: 0, lockoutUntil: null }
            });
          }

          // 7. Return a clean object for NextAuth
          console.log('Login successful for:', email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };

        } catch (error) {
          // Pass the ACCOUNT_LOCKED error up so the frontend can display the timer
          if ((error as Error).message === 'ACCOUNT_LOCKED') {
            throw error;
          }
          
          console.error('Database Error during login:', error);
          return null;
        }
      },
    }),
  ],
});