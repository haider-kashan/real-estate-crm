import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from './app/lib/prisma';
import bcrypt from 'bcryptjs';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Ensure you test with a password at least 6 chars long!
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validate the input fields
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Validation failed (e.g. password too short):', parsedCredentials.error);
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

          // 3. Compare the hashed passwords
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (!passwordsMatch) {
            console.log('Login failed: Passwords do not match.');
            return null;
          }

          // 4. Return a clean object for NextAuth
          console.log('Login successful for:', email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };

        } catch (error) {
          // 5. Catch those PostgreSQL connection drops!
          console.error('Database Error during login:', error);
          return null;
        }
      },
    }),
  ],
});