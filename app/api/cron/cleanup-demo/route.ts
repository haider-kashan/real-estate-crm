import { NextResponse } from 'next/server';
import { resetDemoData } from '../../../lib/auth-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. SECURITY: Verify the request carries CRON_SECRET if configured
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const keyParam = url.searchParams.get('key');

  const isAuthorized =
    !process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    keyParam === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. THE REFRESH: Reset all demo data to pristine state
    await resetDemoData();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Demo accounts and sandbox leads refreshed to pristine state 🚀',
    });
  } catch (error) {
    console.error('Cron Job Cleanup Error:', error);
    return NextResponse.json(
      { success: false, error: 'Demo refresh failed' },
      { status: 500 }
    );
  }
}