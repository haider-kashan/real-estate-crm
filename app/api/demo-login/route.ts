import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const DEMO_USER_ID = 'user_3IMG5oxwSZ9D6nOWJAZWEcIeOgL';
const DEMO_EMAIL = 'demo.agent@useestatepulse.com';

/**
 * POST /api/demo-login
 *
 * Fast 1-click single-use sign-in ticket issuer for the demo account.
 * Response time: ~100ms.
 */
export async function POST() {
  try {
    const client = await clerkClient();

    // Generate single-use ticket token valid for 5 minutes
    const token = await client.signInTokens.createSignInToken({
      userId: DEMO_USER_ID,
      expiresInSeconds: 300,
    });

    return NextResponse.json({
      success: true,
      token: token.token,
    });
  } catch (error: any) {
    console.error('[demo-login] Failed to generate demo ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate demo session' },
      { status: 500 }
    );
  }
}
