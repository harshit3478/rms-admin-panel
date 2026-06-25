import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function DELETE(req: Request) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

  try {
    await adminAuth.deleteUser(uid);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
