import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// Prevent Next.js from statically generating this route at build time.
// Without this, Next.js would try to run the database query during `next build`,
// which fails because there's no database connection in CI.
export const dynamic = 'force-dynamic';

/**
 * GET /api/keep-alive
 *
 * Lightweight health-check endpoint that pings the database to prevent
 * Supabase free-tier from pausing after 7 days of inactivity.
 *
 * Protected by CRON_SECRET to prevent public abuse.
 */
export async function GET(request: Request) {
  // 1. Verify the request carries a valid secret
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 2. Run the cheapest possible query — just checks the connection is alive
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Database is alive',
    });
  } catch (error) {
    console.error('[keep-alive] Database ping failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Database ping failed',
      },
      { status: 500 }
    );
  }
}
