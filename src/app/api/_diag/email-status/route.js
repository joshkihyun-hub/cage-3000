// TEMPORARY DIAGNOSTIC ROUTE — DELETE AFTER USE
//
// Usage:
//   GET /api/_diag/email-status?token=<DIAG_TOKEN>
//     → env vars (masked) + whether sendEmail import is OK
//
//   GET /api/_diag/email-status?token=<DIAG_TOKEN>&to=joshkihyun@naver.com
//     → also attempts an actual Resend send and returns the raw result/error
//
// Token-protected so casual visitors can't probe the endpoint.
// Remove this file (and its parent dir) once the email pipeline is confirmed.

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const DIAG_TOKEN = 'cage3000-diag-2026-05-26';

function maskKey(k) {
  if (!k) return '(missing)';
  if (typeof k !== 'string') return `(non-string, type=${typeof k})`;
  if (k.length <= 8) return `(too short, len=${k.length}, value="${k}")`;
  return `${k.slice(0, 4)}...${k.slice(-4)} (len=${k.length})`;
}

export async function GET(req) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (token !== DIAG_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const env = {
    RESEND_API_KEY: maskKey(process.env.RESEND_API_KEY),
    EMAIL_FROM: process.env.EMAIL_FROM || '(missing)',
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || '(missing)',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '(missing)',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(missing)',
    NODE_ENV: process.env.NODE_ENV,
  };

  const to = url.searchParams.get('to');
  if (!to) {
    return NextResponse.json({
      env,
      hint: 'add &to=<email> to actually attempt a send and see the real Resend response',
    });
  }

  const t0 = Date.now();
  const result = { attempted: true, ok: false };
  try {
    const data = await sendEmail({
      to,
      subject: '[CAGE3000] Diagnostic test',
      html: '<p>Diagnostic test email from /api/_diag/email-status</p>',
      text: 'Diagnostic test',
    });
    result.ok = true;
    result.data = data;
  } catch (err) {
    result.thrown = {
      name: err?.name,
      message: err?.message,
      cause: err?.cause ? String(err.cause) : undefined,
      stack: err?.stack?.split('\n').slice(0, 6).join('\n'),
    };
  }
  result.duration_ms = Date.now() - t0;

  return NextResponse.json({ env, resendTest: result });
}
