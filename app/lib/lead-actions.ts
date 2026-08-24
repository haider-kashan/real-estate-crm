'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUserId } from './auth';

// --- ACTION 1: UPDATE THE STICKY NOTE ---
export async function updateLeadStickyNote(leadId: number, content: string) {
  try {
    const userId = await getAuthenticatedUserId();
    
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { notes: content }, // Saves to the flat string field
    });
    
    // Tell Next.js to instantly refresh the Lead page to show the new note
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update sticky note:', error);
    return { success: false, error: 'Failed to update note.' };
  }
}

// --- ACTION 2: ADD AN ACTIVITY LOG ---
export async function addLeadActivityLog(
  leadId: number, 
  userId: string, 
  type: 'call' | 'whatsapp' | 'meeting' | 'system', 
  content: string
) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.userId !== currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.note.create({
      data: {
        leadId: leadId,
        userId: currentUserId,
        type: type,
        content: content,
      }
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContacted: new Date() }
    });

    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add activity log:', error);
    return { success: false, error: 'Failed to add log.' };
  }
}