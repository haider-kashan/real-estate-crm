'use server';

import { demoLeads } from './dummy-data';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { requireDbUser } from './auth';
import { clerkClient } from '@clerk/nextjs/server';

export async function updateProfile(formData: FormData) {
  const dbUser = await requireDbUser();

  if (!dbUser?.id) return { error: "Not authenticated" };

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const agencyName = formData.get('agencyName') as string;
  const agencyAddress = formData.get('agencyAddress') as string;
  const logoUrl = formData.get('logoUrl') as string;

  try {
    await prisma.user.update({
      where: { id: dbUser.id },
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
  const dbUser = await requireDbUser();
  
  if (!dbUser) return null;

  return {
    name: dbUser.agencyName || dbUser.name || "Real Estate Agency",
    phone: dbUser.phone || "",
    email: dbUser.email || "",
    address: dbUser.agencyAddress || "",
    logo: dbUser.logoUrl || null
  };
}

/**
 * Generates a 1-click Clerk Sign-in Token (ticket) for the Demo User
 * so any prospect can immediately test the CRM with full data without registering.
 */
export async function getOrCreateDemoSignInUrl(): Promise<string> {
  const client = await clerkClient();
  const demoEmail = 'demo.agent@useestatepulse.com';

  // 1. Find or create the Demo user in Clerk
  const existingUsers = await client.users.getUserList({
    emailAddress: [demoEmail],
  });

  let clerkDemoUser;
  if (existingUsers.data.length > 0) {
    clerkDemoUser = existingUsers.data[0];
  } else {
    clerkDemoUser = await client.users.createUser({
      emailAddress: [demoEmail],
      firstName: 'Demo',
      lastName: 'Agent',
      password: 'DemoEstatePulse2026!Secure',
      skipPasswordRequirement: false,
    });
  }

  // 2. Ensure Demo User exists in PostgreSQL Database
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: clerkDemoUser.id },
        { email: demoEmail },
      ],
    },
  });

  if (dbUser) {
    if (dbUser.id !== clerkDemoUser.id) {
      // Clean up old demo user record (cascades old leads/notes/invoices)
      await prisma.user.delete({ where: { id: dbUser.id } });

      dbUser = await prisma.user.create({
        data: {
          id: clerkDemoUser.id,
          email: demoEmail,
          name: 'Demo Agent',
          agencyName: 'EstatePulse Demo Realty',
          agencyAddress: '742 Evergreen Terrace, Suite 100',
          logoUrl: clerkDemoUser.imageUrl || null,
          plan: 'pro',
          isDemo: true,
          isAssigned: false,
        },
      });
    } else {
      dbUser = await prisma.user.update({
        where: { id: clerkDemoUser.id },
        data: { isDemo: true },
      });
    }
  } else {
    dbUser = await prisma.user.create({
      data: {
        id: clerkDemoUser.id,
        email: demoEmail,
        name: 'Demo Agent',
        agencyName: 'EstatePulse Demo Realty',
        agencyAddress: '742 Evergreen Terrace, Suite 100',
        logoUrl: clerkDemoUser.imageUrl || null,
        plan: 'pro',
        isDemo: true,
        isAssigned: false,
      },
    });
  }

  // 3. Ensure Demo leads and analytics exist
  const existingLeads = await prisma.lead.count({
    where: { userId: dbUser.id },
  });

  if (existingLeads === 0) {
    await seedDemoUserData(dbUser.id);
  }

  // 4. Generate 1-click Sign-In Token (ticket) valid for 10 minutes
  const signInToken = await client.signInTokens.createSignInToken({
    userId: clerkDemoUser.id,
    expiresInSeconds: 600,
  });

  return `/login?ticket=${signInToken.token}`;
}

/**
 * Seeds all 14 realistic demo leads, notes, and activity logs for a user.
 */
export async function seedDemoUserData(userId: string) {
  for (const dummy of demoLeads) {
    await prisma.lead.create({
      data: {
        ...dummy.leadInfo,
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logs: {
          create: dummy.logs.map((log: any) => ({ ...log, userId })),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoices: {
          create: dummy.invoices.map((invoice: any) => ({ ...invoice, userId })),
        },
      },
    });
  }

  // Inject demo analytics events for charts
  const mockEvents = [];
  const eventTypes = ['mark_contacted', 'set_reminder', 'click_share', 'click_call', 'click_whatsapp'];
  for (let j = 0; j < 50; j++) {
    mockEvents.push({
      eventName: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)),
      userId,
    });
  }

  await prisma.analyticsEvent.createMany({
    data: mockEvents,
  });
}

/**
 * Resets all demo user accounts in the Rotating Demo Pool to pristine state (called by cron nightly).
 */
export async function resetDemoData() {
  const poolAccounts = await prisma.demoAccountPool.findMany();

  for (const account of poolAccounts) {
    // Delete existing demo leads, notes, invoices, and analytics
    await prisma.analyticsEvent.deleteMany({ where: { userId: account.id } });
    await prisma.note.deleteMany({ where: { userId: account.id } });
    await prisma.invoice.deleteMany({ where: { userId: account.id } });
    await prisma.lead.deleteMany({ where: { userId: account.id } });

    // Reseed pristine demo dataset
    await seedDemoUserData(account.id);
  }

  // Reset inUse flags to false for all demo accounts
  await prisma.demoAccountPool.updateMany({
    data: {
      inUse: false,
    },
  });
}

// Sandbox replenishment utility
export async function replenishSandboxPool(count: number = 20) {
  await resetDemoData();
}