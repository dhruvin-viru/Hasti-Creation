import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exempt public authentication routes
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  // Hardened security protection for all /api/admin/* endpoints
  if (pathname.startsWith('/api/admin/')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      );
    }

    try {
      const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
      const [email] = decoded.split(':');
      const expectedEmail = process.env.ADMIN_EMAIL || 'dhruvinviradiya1543@gmail.com';

      if (email !== expectedEmail) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid admin session' },
          { status: 401 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Malformed session token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
