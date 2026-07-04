'use server';

import { signIn, signOut, auth } from '../../auth';
import { AuthError } from 'next-auth';
import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import { redirect } from 'next/navigation';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string; 

  if (!email || email.trim() === '') return 'Email cannot be empty.';
  if (!password || password.trim() === '') return 'Password cannot be empty.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user && !user.isVerified) {
      return 'Please verify your email before logging in.';
    }

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

export async function register(prevState: string | undefined, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const agencyName = formData.get('agencyName') as string;

  if (!email || !password || !name) return 'Missing fields';
  if (password.length < 6) return 'Password must be at least 6 characters long.';
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser && existingUser.isVerified) {
      return 'User already exists.';
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isVerified) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, verificationCode, codeExpiresAt, name, agencyName }
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          agencyName,
          plan: 'free',
          isVerified: false,
          verificationCode,
          codeExpiresAt
        },
      });
    }

    await transporter.sendMail({
      from: '"Real Estate Leads" <devtrixlab@gmail.com>',
      to: email,
      subject: "Verify your account",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your verification code is: <strong style="font-size: 24px; letter-spacing: 4px;">${verificationCode}</strong></p>
        <p>This code expires in 15 minutes.</p>
      `,
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return 'Failed to create user.';
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;

  if (!email || !code) return 'Missing information.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return 'User not found.';
    if (user.isVerified) return 'User is already verified.';
    if (user.verificationCode !== Number(code)) return 'Invalid verification code.';
    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      return 'Verification code has expired. Please register again.';
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      }
    });

    return 'success';
  } catch (error) {
    console.error('Verification Error:', error);
    return 'Verification failed. Please try again.';
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}

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
      data: { name, phone, agencyName, agencyAddress, logoUrl },
    });

    revalidatePath('/profile');
    revalidatePath('/');
    
    return { success: "Profile updated successfully!" };
  } catch (error) {
    console.error("Update failed:", error);
    return { error: "Failed to update profile." };
  }
}

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

export async function resendVerificationCode(email: string) {
  if (!email) return { error: 'Email is missing.' };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return { error: 'User not found.' };
    if (user.isVerified) return { error: 'Account is already verified.' };

    // Generate a fresh code and new 2-minute expiration
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Save to database
    await prisma.user.update({
      where: { email },
      data: { verificationCode, codeExpiresAt }
    });

    // Send the new email
    await transporter.sendMail({
      from: '"Real Estate Leads" <devtrixlab@gmail.com>',
      to: email,
      subject: "Your New Verification Code",
      html: `
        <h2>Here is your new code!</h2>
        <p>Your verification code is: <strong style="font-size: 24px; letter-spacing: 4px;">${verificationCode}</strong></p>
        <p>This code expires in 2 minutes.</p>
      `,
    });

    return { success: 'A new code has been sent to your email.' };
  } catch (error) {
    console.error('Resend Error:', error);
    return { error: 'Failed to resend code. Please try again.' };
  }
}