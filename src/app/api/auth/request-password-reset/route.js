import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueEmailToken } from '@/lib/email-tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';

// Always return success regardless of whether the email exists so that this
// endpoint cannot be used to enumerate registered emails.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }
  const email = String(body?.email || '').trim().toLowerCase();

  console.log(`[forgot-password] requested for: ${email}`);

  if (!isValidEmail(email)) {
    console.log('[forgot-password] invalid email format, skipping send');
    return NextResponse.json({ status: 'ok' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, status: true, hashedPassword: true },
  });

  if (!user) {
    console.log(`[forgot-password] no account found for ${email} (skipping send)`);
    return NextResponse.json({ status: 'ok' });
  }
  if (user.status !== 'active') {
    console.log(`[forgot-password] account not active (status=${user.status}) for ${email}`);
    return NextResponse.json({ status: 'ok' });
  }
  if (!user.hashedPassword) {
    console.log(`[forgot-password] account has no password (social login?) for ${email}`);
    return NextResponse.json({ status: 'ok' });
  }

  try {
    const token = await issueEmailToken({ userId: user.id, purpose: 'password_reset' });
    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
    console.log(`[forgot-password] reset email sent to ${user.email}`);
  } catch (err) {
    console.error(`[forgot-password] email send failed for ${user.email}`, {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
  }

  return NextResponse.json({ status: 'ok' });
}
