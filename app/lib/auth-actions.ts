'use server';
import { demoLeads } from './dummy-data';
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

function canSendCode(user: any) {
  if (!user || !user.lastCodeSentAt) return true;
  
  const now = new Date();
  const lastSent = new Date(user.lastCodeSentAt);
  const isSameDay = lastSent.getDate() === now.getDate() && 
                    lastSent.getMonth() === now.getMonth() && 
                    lastSent.getFullYear() === now.getFullYear();

  if (isSameDay && user.dailyCodeCount >= 3) {
    return false; // Limit reached
  }
  return true;
}

function getRateLimitData(user: any) {
  const now = new Date();
  let newCount = 1;
  
  if (user && user.lastCodeSentAt) {
    const lastSent = new Date(user.lastCodeSentAt);
    const isSameDay = lastSent.getDate() === now.getDate() && 
                      lastSent.getMonth() === now.getMonth() && 
                      lastSent.getFullYear() === now.getFullYear();
    
    if (isSameDay) {
      newCount = (user.dailyCodeCount || 0) + 1;
    }
  }
  
  return { dailyCodeCount: newCount, lastCodeSentAt: now };
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string; 

  if (!email || email.trim() === '') return 'Email cannot be empty.';
  if (!password || password.trim() === '') return 'Password cannot be empty.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      return `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`;
    }
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
    if ((error as Error).message.includes('ACCOUNT_LOCKED')) {
      return 'Account locked due to too many failed attempts. Try again in 15 minutes.';
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
    if (!canSendCode(existingUser)) return 'Daily email limit reached (3/day). Please try again tomorrow.'; 
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const rateData = getRateLimitData(existingUser);

    if (existingUser && !existingUser.isVerified) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, verificationCode, codeExpiresAt, name, agencyName, ...rateData }
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
          codeExpiresAt,
          ...rateData
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
    if (!canSendCode(user)) return { error: 'Daily limit reached (3/day). Please try again tomorrow.' };

    // Generate a fresh code and new 2-minute expiration
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const rateData = getRateLimitData(user);
    // Save to database
    await prisma.user.update({
      where: { email },
      data: { verificationCode, codeExpiresAt, ...rateData }
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

// --- 7. REQUEST PASSWORD RESET ---
export async function requestPasswordReset(prevState: string | undefined, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  
  if (!email) return 'Email cannot be empty.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security Best Practice: We do not reveal if the email exists or not to prevent attackers from guessing emails.
    if (!user) {
      redirect(`/reset-password?email=${encodeURIComponent(email)}`);
    }
    if (!canSendCode(user)) return 'Daily limit reached (3/day). Please try again tomorrow.';
    // Generate code (10-minute expiration)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = new Date(Date.now() + 3 * 60 * 1000);
    const rateData = getRateLimitData(user);
    await prisma.user.update({
      where: { email },
      data: { verificationCode, codeExpiresAt, ...rateData }
    });

    await transporter.sendMail({
      from: '"Real Estate Leads" <devtrixlab@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Your password reset code is: <strong style="font-size: 24px; letter-spacing: 4px;">${verificationCode}</strong></p>
        <p>This code expires in 3 minutes. If you did not request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Password Reset Request Error:', error);
    return 'Failed to process request. Please try again.';
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

// --- 8. RESET PASSWORD ---
export async function resetPassword(prevState: string | undefined, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const code = (formData.get('code') as string)?.trim();
  const newPassword = (formData.get('newPassword') as string)?.trim();

  if (!email || !code || !newPassword) return 'All fields are required.';
  if (newPassword.length < 6) return 'Password must be at least 6 characters long.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return 'Invalid request.';
    if (user.verificationCode !== Number(code)) return 'Invalid reset code.';
    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) return 'Reset code has expired.';

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save it and clear the reset codes
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verificationCode: null,
        codeExpiresAt: null,
      }
    });

    return 'success';
  } catch (error) {
    console.error('Password Reset Error:', error);
    return 'Failed to reset password. Please try again.';
  }
}

// --- 10. GENERATE DEMO ACCOUNT (Ephemeral Sandbox) ---
export async function createDemoAccount() {
  try {
    let demoPassword = 'demopassword123';
    let demoEmail = '';

    // 1. Atomically try to grab an unassigned, pre-generated sandbox from the pool
    // This entirely prevents simultaneous login race conditions
    const assignedUsers: any[] = await prisma.$queryRaw`
      UPDATE "users" 
      SET "isAssigned" = true, "createdAt" = NOW()
      WHERE id = (
        SELECT id FROM "users" 
        WHERE "isDemo" = true AND "isAssigned" = false 
        LIMIT 1 
        FOR UPDATE SKIP LOCKED
      ) 
      RETURNING *;
    `;

    let demoUser = assignedUsers[0] || null;

    if (demoUser) {
      // INSTANT PATH: Claimed the pre-generated sandbox
      demoEmail = demoUser.email;
    } else {
      // FALLBACK PATH: The pool ran dry, generate one on-the-fly
      console.warn("Sandbox pool ran dry! Generating on-the-fly...");
      await replenishSandboxPool(1);
      
      const fallbackUsers: any[] = await prisma.$queryRaw`
        UPDATE "users" SET "isAssigned" = true, "createdAt" = NOW() WHERE id = (SELECT id FROM "users" WHERE "isDemo" = true AND "isAssigned" = false LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *;
      `;
      if (!fallbackUsers[0]) throw new Error("Failed to generate fallback sandbox");
      demoEmail = fallbackUsers[0].email;
    }

    // 2. SIGN THEM IN AUTOMATICALLY
    // Since we updated auth.ts to bypass bcrypt for demo accounts, this will take < 50ms
    await signIn('credentials', {
      email: demoEmail,
      password: demoPassword,
      redirectTo: '/',
    });

  } catch (error) {
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
      throw error; 
    }
    console.error('Demo Account Creation Error:', error);
    return 'Failed to generate demo account. Please try again.';
  }
}

// --- 11. REPLENISH SANDBOX POOL ---
// This function can be called by a CRON job to pre-generate ready-to-use sandboxes
export async function replenishSandboxPool(count: number = 20) {
  const demoPassword = 'demopassword123'; 
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  for (let i = 0; i < count; i++) {
    const randomId = Math.random().toString(36).substring(2, 8);
    const demoEmail = `demo_${randomId}@trydemo.com`;

    // CREATE THE USER (initially marked as assigned so no one grabs an incomplete sandbox)
    const demoUser = await prisma.user.create({
      data: {
        name: 'Demo Agent',
        agencyName: 'Demo Real Estate',
        email: demoEmail,
        password: hashedPassword,
        isVerified: true, 
        isDemo: true,     
        isAssigned: true, // Hide it from the pool initially
        plan: 'free',
      }
    });

    // INJECT DUMMY DATA WITH NESTED RELATIONS
    for (const dummy of demoLeads) {
      await prisma.lead.create({
        data: {
          ...dummy.leadInfo,
          userId: demoUser.id,
          logs: {
            create: dummy.logs.map((log: any) => ({ ...log, userId: demoUser.id }))
          },
          invoices: {
            create: dummy.invoices.map((invoice: any) => ({ ...invoice, userId: demoUser.id }))
          }
        }
      });
    }

    // INJECT DEMO ANALYTICS EVENTS (Mock traffic data)
    const mockEvents = [];
    const eventTypes = ['mark_contacted', 'set_reminder', 'click_share', 'click_call', 'click_whatsapp'];
    for (let j = 0; j < 50; j++) {
      mockEvents.push({
        eventName: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)),
        userId: demoUser.id
      });
    }
    
    await prisma.analyticsEvent.createMany({
      data: mockEvents
    });

    // FINALLY: Release the fully generated sandbox into the pool
    await prisma.user.update({
      where: { id: demoUser.id },
      data: { isAssigned: false }
    });
  }
}