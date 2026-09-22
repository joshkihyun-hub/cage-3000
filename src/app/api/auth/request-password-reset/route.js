import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueEmailToken } from '@/lib/email-tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Always return success regardless of whether the email exists so that this
// endpoint cannot be used to enumerate registered emails.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }
  const email = String(body?.email || '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ status: 'ok' });
  }

  // Caps mail volume per sender and per inbox so this can't be used to flood
  // someone's mailbox or burn the Resend quota. Over the limit we skip the
  // send but still answer 'ok' — the limit applies whether or not the email
  // exists, so it leaks nothing.
  const byIp = await rateLimit(`pwreset:ip:${getClientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  const byEmail = await rateLimit(`pwreset:email:${email}`, { limit: 3, windowMs: 15 * 60_000 });
  if (!byIp.ok || !byEmail.ok) {
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
