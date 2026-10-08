import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkLoginLockout, recordFailedLogin, resetLoginLockout } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body || {};

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || email || 'global';
    const lockoutKey = `${clientIp}_${email || ''}`;

    // 1. Check if user/IP is locked out
    const lockoutStatus = checkLoginLockout(lockoutKey);
    if (lockoutStatus.locked) {
      const remainingMinutes = Math.ceil((lockoutStatus.remainingMs || 0) / (60 * 1000));
      return NextResponse.json({
        error: `Too many failed attempts. Account locked for 15 minutes.`,
        locked: true,
        remainingMinutes,
        success: false
      }, { status: 429 });
    }

    const expectedEmail = process.env.ADMIN_EMAIL || 'dhruvinviradiya1543@gmail.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Dhruvin@1583';

    if (email === expectedEmail && password === expectedPassword) {
      // Successful login -> Reset failed attempt counter
      resetLoginLockout(lockoutKey);

      const cookieStore = cookies();
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Admin authenticated successfully',
        token 
      });
    }

    // Record failed attempt
    const failedResult = recordFailedLogin(lockoutKey);
    if (failedResult.locked) {
      return NextResponse.json({
        error: 'Too many failed attempts. Account locked for 15 minutes.',
        locked: true,
        remainingAttempts: 0,
        success: false
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: `Invalid email or password. ${failedResult.remainingAttempts} attempt(s) remaining before 15-minute lockout.`, 
      remainingAttempts: failedResult.remainingAttempts,
      success: false 
    }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Server error during authentication', 
      success: false 
    }, { status: 500 });
  }
}
