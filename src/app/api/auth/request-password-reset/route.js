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

  if (!isValidEmail(email)) {
    return NextResponse.json({ status: 'ok' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, status: true, hashedPassword: true },
  });

  // Silently no-op when the account isn't eligible for reset (missing,
  // suspended/withdrawn, or social-only) — same 'ok' response keeps the
  // endpoint from leaking which case applied.
  if (!user || user.status !== 'active' || !user.hashedPassword) {
    return NextResponse.json({ status: 'ok' });
  }

  try {
    const token = await issueEmailToken({ userId: user.id, purpose: 'password_reset' });
    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
  } catch (err) {
    console.error(`[forgot-password] email send failed for ${user.email}`, {
      message: err?.message,
      name: err?.name,
    });
  }

  return NextResponse.json({ status: 'ok' });
}
