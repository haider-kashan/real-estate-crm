'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '../auth'; 
import prisma from './lib/prisma'; 

// --- HELPER: GET CURRENT USER ID ---
async function getUserId() {
  const session = await auth(); 
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please login first.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found.");
  
  return user.id; 
}

// 1. GET ALL LEADS
export async function getLeads() {
  try {
    const userId = await getUserId();
    const leads = await prisma.lead.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
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

export async function loadMoreLeads(skipCount: number) {
  try {
    const userId = await getUserId();
    const leads = await prisma.lead.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      skip: skipCount, // <-- This tells Prisma to skip the leads we already have
      take: 50,        // <-- Grab the next 50
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

// 2. GET SINGLE LEAD
export async function getLead(id: number) {
  try {
    const userId = await getUserId();
    const lead = await prisma.lead.findUnique({
      where: { id },
    });
    
    if (lead?.userId !== userId) return null;
    return lead;
  } catch (error) {
    return null;
  }
}

// 3. ADD LEAD
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
        notes: data.notes
      },
    });
    
    revalidatePath('/');
    return { success: true, lead: newLead };
  } catch (error) {
    console.error('Failed to add lead:', error);
    return { success: false, error };
  }
}

// 4. UPDATE LEAD (Fixed & Cleaned)
export async function updateLead(id: number, data: any) {
  try {
    const userId = await getUserId();
    const existing = await prisma.lead.findUnique({ where: { id } });
    
    if (existing?.userId !== userId) return { success: false, error: "Unauthorized" };

    // Remove metadata that Prisma shouldn't update directly
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
      data: updateData,
    });

    revalidatePath(`/leads/${id}`);
    revalidatePath('/');
    
    return { success: true, lead: updatedLead };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update lead" };
  }
}

// 5. DELETE LEAD
export async function deleteLead(id: number) {
  try {
    const userId = await getUserId();
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (existing?.userId !== userId) return { success: false, error: "Unauthorized" };

    await prisma.lead.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function trackEvent(eventName: string) {
  try {
    await prisma.analyticsEvent.create({
      data: { eventName }
    });
  } catch (error) {
    console.error("Tracking failed:", error);
  }
}