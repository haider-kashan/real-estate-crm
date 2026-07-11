import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

import { replenishSandboxPool } from '../../../lib/auth-actions';

export async function GET(request: Request) {
  // 1. SECURITY: Verify the request is actually coming from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. THE CLEANUP: Find demo accounts older than 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await prisma.user.deleteMany({
      where: {
        isDemo: true, // EXTREME SAFETY: Only ever delete demo accounts
        createdAt: { lt: yesterday }
      }
    });

    // 3. THE REPLENISHMENT: Generate 20 fresh sandbox accounts for the new day
    await replenishSandboxPool(20);

    return NextResponse.json({ success: true, deletedCount: result.count, replenished: 20 });
  } catch (error) {
    console.error('Cron Job Cleanup Error:', error);
    return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
  }
}