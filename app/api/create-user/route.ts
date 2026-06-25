import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const { email, password, displayName } = await req.json();

  try {
    const user = await adminAuth.createUser({ email, password, displayName });
    return NextResponse.json({ uid: user.uid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
