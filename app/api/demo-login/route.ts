import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/demo-login
 *
 * Allocates an available account from DemoAccountPool and generates
 * a single-use Clerk sign-in ticket token.
 */
export async function POST() {
  try {
    const clerk = await clerkClient();

    // 1. Find an available demo account (inUse = false, or oldest lastAssigned)
    let account = await prisma.demoAccountPool.findFirst({
      where: { inUse: false },
      orderBy: { lastAssigned: 'asc' },
    });

    // If all are currently marked inUse, pick the one assigned longest ago
    if (!account) {
      account = await prisma.demoAccountPool.findFirst({
        orderBy: { lastAssigned: 'asc' },
      });
    }

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'No demo accounts available in pool. Please run reset-demos.' },
        { status: 503 }
      );
    }

    // 2. Mark account as inUse and update lastAssigned timestamp
    await prisma.demoAccountPool.update({
      where: { id: account.id },
      data: {
        inUse: true,
        lastAssigned: new Date(),
      },
    });

    // 3. Generate single-use ticket valid for 5 minutes
    const signInToken = await clerk.signInTokens.createSignInToken({
      userId: account.id,
      expiresInSeconds: 300,
    });

    return NextResponse.json({
      success: true,
      token: signInToken.token,
      email: account.email,
      userId: account.id,
    });
  } catch (error: any) {
    console.error('[demo-login API] Error allocating demo account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to allocate demo account' },
      { status: 500 }
    );
  }
}
