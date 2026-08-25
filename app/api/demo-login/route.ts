import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/app/lib/prisma';
import { seedDemoUserData } from '@/app/lib/auth-actions';

export const dynamic = 'force-dynamic';

const DEMO_EMAILS = Array.from({ length: 20 }, (_, i) => `demo.agent${i + 1}@useestatepulse.com`);

/**
 * Helper to ensure a demo user exists in both Clerk and Supabase,
 * and that their ID in DemoAccountPool is synchronized with the active Clerk instance.
 */
async function resolveClerkDemoUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clerk: any,
  email: string,
  currentId?: string
): Promise<string> {
  // 1. If we have an ID, check if it exists in the active Clerk instance
  if (currentId) {
    try {
      const user = await clerk.users.getUser(currentId);
      if (user && user.id) {
        return user.id;
      }
    } catch {
      // User does not exist in this Clerk instance (e.g. env key mismatch or recreation)
      console.warn(`[demo-login] User ${currentId} not found in current Clerk instance. Resolving by email...`);
    }
  }

  // 2. Lookup by email in active Clerk instance
  const existing = await clerk.users.getUserList({ emailAddress: [email] });
  let validUserId: string;

  if (existing.data && existing.data.length > 0) {
    validUserId = existing.data[0].id;
  } else {
    // 3. Create fresh Clerk user in active instance
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName: 'Demo',
      lastName: 'Agent',
      skipPasswordRequirement: true,
    });
    validUserId = newUser.id;
  }

  // 4. Synchronize DemoAccountPool
  await prisma.demoAccountPool.upsert({
    where: { email },
    update: { id: validUserId, inUse: true, lastAssigned: new Date() },
    create: { id: validUserId, email, inUse: true, lastAssigned: new Date() },
  });

  // 5. Synchronize User record in database
  const dbUser = await prisma.user.upsert({
    where: { id: validUserId },
    update: { email, name: 'Demo Agent', isDemo: true },
    create: {
      id: validUserId,
      email,
      name: 'Demo Agent',
      agencyName: 'EstatePulse Demo Agency',
      isDemo: true,
      plan: 'pro',
    },
  });

  // 6. Ensure sample leads and analytics exist
  const leadCount = await prisma.lead.count({ where: { userId: dbUser.id } });
  if (leadCount === 0) {
    await seedDemoUserData(dbUser.id);
  }

  return validUserId;
}

/**
 * POST /api/demo-login
 *
 * Allocates an available account from DemoAccountPool and generates
 * a single-use Clerk sign-in ticket token.
 * Self-heals automatically across development, preview, and production Clerk instances.
 */
export async function POST() {
  try {
    const clerk = await clerkClient();

    // 1. Find an available demo account from pool (inUse = false, or oldest lastAssigned)
    let account = await prisma.demoAccountPool.findFirst({
      where: { inUse: false },
      orderBy: { lastAssigned: 'asc' },
    });

    if (!account) {
      account = await prisma.demoAccountPool.findFirst({
        orderBy: { lastAssigned: 'asc' },
      });
    }

    const targetEmail = account?.email || DEMO_EMAILS[Math.floor(Math.random() * DEMO_EMAILS.length)];
    const currentId = account?.id;

    // 2. Resolve valid Clerk user ID (guarantees user exists in active Clerk instance)
    const validUserId = await resolveClerkDemoUser(clerk, targetEmail, currentId);

    // 3. Mark account inUse and update timestamp
    await prisma.demoAccountPool.updateMany({
      where: { id: validUserId },
      data: { inUse: true, lastAssigned: new Date() },
    });

    // 4. Generate single-use ticket valid for 5 minutes
    const signInToken = await clerk.signInTokens.createSignInToken({
      userId: validUserId,
      expiresInSeconds: 300,
    });

    return NextResponse.json({
      success: true,
      token: signInToken.token,
      email: targetEmail,
      userId: validUserId,
    });
  } catch (error: any) {
    console.error('[demo-login API] Error allocating demo account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to allocate demo account' },
      { status: 500 }
    );
  }
}
