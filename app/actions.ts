'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { auth } from '../auth';
import prisma from './lib/prisma';
import { sendFollowupScheduledAlert } from './lib/automation';

// --- HELPER: GET CURRENT USER ID ---
async function getUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please login first.');
  }

  return session.user.id;
}

// 1. GET LEADS (First 20 - Full Data)
export async function getLeads() {
  try {
    const userId = await getUserId();
    
    // We wrap the Prisma query in a Vercel Cache
    const getCachedData = unstable_cache(
      async (uid) => {
        return await prisma.lead.findMany({
          where: { userId: uid },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            location: true,
            phone: true,
            budget: true,
            demand: true,
            propertyType: true,
            createdAt: true,
            lastContacted: true,
            followUp: true,
          }
        });
      },
      [`leads-key-${userId}`],
      { tags: [`leads-${userId}`], revalidate: 60 }
    );

    return await getCachedData(userId);
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// 2. LOAD MORE LEADS (20 More - Full Data)
export async function loadMoreLeads(skipCount: number) {
  try {
    const userId = await getUserId();

    const leads = await prisma.lead.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      skip: skipCount,
      take: 10,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        location: true,
        phone: true,
        budget: true,
        demand: true,
        propertyType: true,
        createdAt: true,
        lastContacted: true,
        followUp: true,
      }
    });

    return leads;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// 3. GET SINGLE LEAD
export async function getLead(id: number) {
  try {
    const userId = await getUserId();

    const getCachedLead = unstable_cache(
      async (leadId) => {
        return await prisma.lead.findUnique({
          where: { 
            id: leadId,
          },
          include: {
            logs: {
              orderBy: { date: 'desc' }
            },
            invoices: {
              orderBy: { createdAt: 'desc' }
            }
          }
        });
      },
      [`lead-detail-${id}`],
      { tags: [`lead-${id}`], revalidate: 60 }
    );

    const lead = await getCachedLead(id);

    if (lead?.userId !== userId) return null;

    return lead;
  } catch (error) {
    return null;
  }
}

// 4. ADD LEAD
export async function addLead(data: any) {
  try {
    const userId = await getUserId();

    const newLead = await prisma.lead.create({
      data: {
        user: { connect: { id: userId } },
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        location: data.location,
        type: data.type,
        status: data.status || 'new',
        propertyType: data.propertyType,
        size: data.size,
        budget: data.budget,
        demand: data.demand,
        floors: data.floors,
        bedrooms: data.bedrooms ? data.bedrooms.toString() : null,
        bathrooms: data.bathrooms ? data.bathrooms.toString() : null,
        hasBasement: data.hasBasement || false,
        isCorner: data.isCorner || false,
        isParkFacing: data.isParkFacing || false,
        isMainRoad: data.isMainRoad || false,
        hasServantQuarter: data.hasServantQuarter || false,
        notes: data.notes,
      },
    });

    revalidatePath('/');
    // @ts-ignore
    revalidateTag(`leads-${userId}`);

    return {
      success: true,
      lead: newLead,
    };
  } catch (error) {
    console.error('Failed to add lead:', error);

    return {
      success: false,
      error,
    };
  }
}

// 5. UPDATE LEAD
export async function updateLead(id: number, data: any) {
  try {
    const userId = await getUserId();

    const existing = await prisma.lead.findUnique({
      where: { id },
    });

    if (existing?.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const {
      id: _id,
      userId: _userId,
      createdAt,
      updatedAt,
      features,
      dateAdded,
      lastContactDate,
      ...updateData
    } = data;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...updateData,
        lastContacted: new Date()
      },
    });

    // EVENT-DRIVEN AUTOMATION: Trigger an email if a new follow-up was scheduled
    if (updateData.followUp && new Date(updateData.followUp).getTime() !== new Date(existing.followUp || 0).getTime()) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        // Fire asynchronously (do not await) so it doesn't block the UI
        sendFollowupScheduledAlert(user.email, user.name || 'Agent', updatedLead).catch(console.error);
      }
    }

    revalidatePath('/');
    revalidatePath(`/leads/${id}`);
    // @ts-ignore
    revalidateTag(`leads-${userId}`);

    return {
      success: true,
      lead: updatedLead,
    };
  } catch (error) {
    console.error('Update Error:', error);

    return {
      success: false,
      error: 'Failed to update lead',
    };
  }
}

// 6. DELETE LEAD
export async function deleteLead(id: number) {
  try {
    const userId = await getUserId();

    const existing = await prisma.lead.findUnique({
      where: { id },
    });

    if (existing?.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    await prisma.lead.delete({
      where: { id },
    });

    revalidatePath('/');
    // @ts-ignore
    revalidateTag(`leads-${userId}`);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}

// 7. TRACK ANALYTICS EVENT
export async function trackEvent(eventName: string) {
  try {
    const userId = await getUserId().catch(() => null); // Silently fail if not logged in
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        userId,
      },
    });
  } catch (error) {
    console.error('Tracking failed:', error);
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: 'paid' | 'pending') {
  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: status },
    });
    
    // Refresh the page so the status badge changes color instantly
    revalidatePath('/leads/[id]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to update invoice status:', error);
    return { success: false, error: 'Could not update status' };
  }
}