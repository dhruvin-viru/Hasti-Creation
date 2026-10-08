import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized', authenticated: false }, { status: 401 });
    }

    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    const expectedEmail = process.env.ADMIN_EMAIL || 'dhruvinviradiya1543@gmail.com';

    if (email === expectedEmail) {
      return NextResponse.json({ authenticated: true, email });
    }

    return NextResponse.json({ error: 'Unauthorized', authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized', authenticated: false }, { status: 401 });
  }
}
