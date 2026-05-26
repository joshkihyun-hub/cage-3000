import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin() {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

export async function requireActiveUser() {
  const { session, error } = await requireSession();
  if (error) return { error };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true, role: true },
  });

  if (!user || user.status === 'withdrawn') {
    return { error: NextResponse.json({ error: 'Account not found' }, { status: 401 }) };
  }
  if (user.status === 'suspended') {
    return { error: NextResponse.json({ error: 'Account suspended' }, { status: 403 }) };
  }

  return { session, user };
}
