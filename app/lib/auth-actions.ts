'use server';

import { signIn } from '../../auth';
import { AuthError } from 'next-auth';
import prisma from './prisma'; // <--- Points to shared client in same folder
import bcrypt from 'bcryptjs';

// --- 1. HANDLE LOGIN ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/', // Force redirect to Home
    });
  } catch (error) {
    // CRITICAL FIX: Allow the redirect to happen
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// --- 2. HANDLE REGISTRATION ---
export async function register(prevState: string | undefined, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const agencyName = formData.get('agencyName') as string;

  if (!email || !password || !name) return 'Missing fields';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return 'User already exists.';

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        agencyName,
        plan: 'free',
      },
    });

    return 'success';
  } catch (error) {
    console.error('Registration Error:', error);
    return 'Failed to create user.';
  }
}