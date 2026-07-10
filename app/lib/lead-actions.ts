'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';

// --- ACTION 1: UPDATE THE STICKY NOTE ---
// Use this for general "remember this" information.
export async function updateLeadStickyNote(leadId: number, content: string) {
  try {
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
// Use this when they log a call, meeting, or whatsapp finding.
export async function addLeadActivityLog(
  leadId: number, 
  userId: string, 
  type: 'call' | 'whatsapp' | 'meeting' | 'system', 
  content: string
) {
  try {
    await prisma.note.create({
      data: {
        leadId: leadId,
        userId: userId,
        type: type,
        content: content,
        // date: new Date() is added automatically by your schema!
      }
    });

    // You can also automatically update the Lead's "lastContacted" date here!
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