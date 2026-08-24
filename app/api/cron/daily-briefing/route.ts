import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendDailyBriefing } from '@/app/lib/automation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Security: Check Bearer token or ?key param
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const keyParam = url.searchParams.get('key');

  const isAuthorized =
    !process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    keyParam === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch all users
    const users = await prisma.user.findMany();

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let emailsSent = 0;

    for (const user of users) {
      if (!user.email) continue;

      // 2. Find their follow-ups scheduled for today (or overdue)
      const todaysLeads = await prisma.lead.findMany({
        where: {
          userId: user.id,
          followUp: {
            not: null,
            lte: todayEnd // Anything due today or earlier that hasn't been cleared
          }
        },
        orderBy: {
          followUp: 'asc'
        }
      });

      // 3. Send email if there are leads to follow up on
      if (todaysLeads.length > 0) {
        await sendDailyBriefing(user.email, user.name || 'Agent', todaysLeads).catch(console.error);
        emailsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Daily briefing dispatched to ${emailsSent} users.` 
    });

  } catch (error) {
    console.error('Failed to run daily briefing cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
