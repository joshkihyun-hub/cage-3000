import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueEmailToken } from '@/lib/email-tokens';
import { sendVerificationEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';

// Always return success-shaped JSON to prevent email enumeration.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }
  const email = String(body?.email || '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ status: 'ok' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, status: true, emailVerified: true },
  });

  if (user && !user.emailVerified && user.status === 'active') {
    try {
      const token = await issueEmailToken({ userId: user.id, purpose: 'email_verify' });
      await sendVerificationEmail({ to: user.email, name: user.name, token });
    } catch (err) {
      console.error('Resend verification failed:', err);
    }
  }

  return NextResponse.json({ status: 'ok' });
}
