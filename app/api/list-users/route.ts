import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  try {
    const result = await adminAuth.listUsers(1000);
    const users = result.users.map(u => ({
      uid: u.uid,
      email: u.email ?? '',
      displayName: u.displayName ?? '',
      disabled: u.disabled,
      createdAt: u.metadata.creationTime ?? '',
    }));
    // order them by creation time descending
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ users });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list users';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
