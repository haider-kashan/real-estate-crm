import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/keep-alive
 *
 * Health-check & keep-alive endpoint that pings Supabase PostgreSQL
 * with `SELECT 1` to prevent database pausing after 7 days of inactivity.
 */
export async function GET(request: Request) {
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
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const durationMs = Date.now() - start;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTimeMs: durationMs,
      message: 'Supabase database is alive and active 🚀',
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
