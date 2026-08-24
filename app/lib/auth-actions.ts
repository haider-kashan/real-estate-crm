'use server';

import { demoLeads } from './dummy-data';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { requireDbUser } from './auth';

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

// --- REPLENISH SANDBOX POOL ---
// Pre-generate ready-to-use sandboxes for testing/demos if needed
export async function replenishSandboxPool(count: number = 20) {
  for (let i = 0; i < count; i++) {
    const randomId = Math.random().toString(36).substring(2, 8);
    const demoEmail = `demo_${randomId}@trydemo.com`;

    // CREATE THE USER (initially marked as assigned so no one grabs an incomplete sandbox)
    const demoUser = await prisma.user.create({
      data: {
        id: `demo_${randomId}`,
        name: 'Demo Agent',
        agencyName: 'Demo Real Estate',
        email: demoEmail,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logs: {
            create: dummy.logs.map((log: any) => ({ ...log, userId: demoUser.id }))
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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