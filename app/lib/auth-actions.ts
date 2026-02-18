'use server';

import { signIn, signOut } from '../../auth';
import { AuthError } from 'next-auth';
import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { auth } from '../../auth';

// --- 1. HANDLE LOGIN ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/',
    });
  } catch (error) {
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

// --- 2. HANDLE REGISTRATION (Fixed Security) ---
export async function register(prevState: string | undefined, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const agencyName = formData.get('agencyName') as string;

  if (!email || !password || !name) return 'Missing fields';

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return 'User already exists.';

    // 2. CHECK ALLOW LIST (The missing security gate)
    const isAllowed = await prisma.allowedUser.findUnique({ where: { email } });
    
    // If the email is NOT in the AllowedUser table, stop everything.
    if (!isAllowed) {
      return 'Access Denied: This is a closed pilot. Your email is not on the invite list.';
    }

    // 3. Create the user
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

// --- 3. HANDLE LOGOUT ---
export async function logout() {
  await signOut({ redirectTo: '/login' });
}

// --- 4. UPDATE PROFILE (With Logo) ---
export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const agencyName = formData.get('agencyName') as string;
  const agencyAddress = formData.get('agencyAddress') as string;
  const logoUrl = formData.get('logoUrl') as string; 

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        agencyName,
        agencyAddress,
        logoUrl, 
      },
    });

    revalidatePath('/profile');
    revalidatePath('/'); 
    return { success: "Profile updated successfully!" };
  } catch (error) {
    console.error("Update failed:", error);
    return { error: "Failed to update profile." };
  }
}

// --- 5. GET AGENCY DETAILS FOR INVOICE ---
export async function getAgencyDetails() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  return {
    name: user.agencyName || user.name || "Real Estate Agency", 
    phone: user.phone || "",
    email: user.email || "",
    address: user.agencyAddress || "",
    logo: user.logoUrl || null
  };
}