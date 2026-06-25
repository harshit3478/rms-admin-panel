import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const ADMIN_EMAIL = 'DRRAGHAVENDRASHETTY77@gmail.com';
const ADMIN_PASSWORD = 'RMSAdmin@2025!';

export async function POST(req: Request) {
  const { secret } = await req.json();

  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'RMS Admin',
    });
    return NextResponse.json({ uid: user.uid, email: user.email });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-exists') {
      return NextResponse.json({ message: 'Admin account already exists.' });
    }
    const msg = err instanceof Error ? err.message : 'Failed to create admin';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
