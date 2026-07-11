import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendNaggingAlert, sendHealthDropAlert, sendFollowupReminder } from '@/app/lib/automation';

export async function GET(request: Request) {
  // 1. Validate the CRON trigger (Security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. Fetch all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, name: true }
    });

    const now = new Date();
    // Start of today (midnight)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // End of today
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    for (const user of users) {
      if (!user.email) continue;
      const userName = user.name || 'Agent';

      // --- A. THE NAGGING OVERDUE ALERTS ---
      // followUp < startOfToday
      const overdueLeads = await prisma.lead.findMany({
        where: {
          userId: user.id,
          status: { not: 'closed' },
          followUp: { lt: startOfToday }
        }
      });

      for (const lead of overdueLeads) {
        await sendNaggingAlert(user.email, userName, lead);
      }

      // --- B. THE TODAY FOLLOW-UP REMINDERS ---
      // followUp >= startOfToday AND followUp <= endOfToday
      const todayLeads = await prisma.lead.findMany({
        where: {
          userId: user.id,
          status: { not: 'closed' },
          followUp: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      });

      for (const lead of todayLeads) {
        await sendFollowupReminder(user.email, userName, lead);
      }

      // --- C. THE HEALTH DROP ALERTS ---
      // lastContacted < sevenDaysAgo
      const rottingLeads = await prisma.lead.findMany({
        where: {
          userId: user.id,
          status: { notIn: ['closed', 'lost'] }, // ignore if closed or lost
          lastContacted: { lt: sevenDaysAgo }
        }
      });

      for (const lead of rottingLeads) {
        await sendHealthDropAlert(user.email, userName, lead);
      }
    }

    return NextResponse.json({ success: true, message: "Automations dispatched successfully." });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Failed to run automations" }, { status: 500 });
  }
}
