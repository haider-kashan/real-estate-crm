import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { seedDemoUserData } from '@/app/lib/auth-actions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/reset-demos
 *
 * Nightly reset cron that cleans and re-seeds all 20 demo accounts in the
 * Rotating Demo Pool and resets their `inUse` flags to false.
 */
export async function GET(request: Request) {
  // 1. Verify CRON_SECRET if configured
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
    // 2. Fetch all demo pool accounts
    const poolAccounts = await prisma.demoAccountPool.findMany();

    console.log(`[reset-demos] Resetting ${poolAccounts.length} demo accounts in pool...`);

    for (const account of poolAccounts) {
      // Clean previous data for this demo user
      await prisma.analyticsEvent.deleteMany({ where: { userId: account.id } });
      await prisma.note.deleteMany({ where: { userId: account.id } });
      await prisma.invoice.deleteMany({ where: { userId: account.id } });
      await prisma.lead.deleteMany({ where: { userId: account.id } });

      // Re-seed pristine 14 sample leads & analytics
      await seedDemoUserData(account.id);
    }

    // 3. Reset inUse flags to false for all accounts in pool
    await prisma.demoAccountPool.updateMany({
      data: {
        inUse: false,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resetCount: poolAccounts.length,
      message: `Successfully reset and re-seeded all ${poolAccounts.length} demo accounts in pool 🚀`,
    });
  } catch (error: any) {
    console.error('[reset-demos] Error resetting demo accounts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset demo pool' },
      { status: 500 }
    );
  }
}
