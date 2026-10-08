import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeEmailToken } from '@/lib/email-tokens';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req) {
  // 링크를 마구 대입해 보는 요청을 묶어 둔다.
  const limited = await rateLimit(`verify-submit:${getClientIp(req)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { token } = body || {};
  if (!token) {
    return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 });
  }

  try {
    const user = await consumeEmailToken({ token, purpose: 'email_verify' });
    if (user.emailVerified) {
      return NextResponse.json({ status: 'already_verified' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    return NextResponse.json({ status: 'verified', email: user.email });
  } catch (err) {
    const code = err.message;
    if (code === 'TOKEN_INVALID') {
      return NextResponse.json({ error: '유효하지 않은 인증 링크입니다.' }, { status: 400 });
    }
    if (code === 'TOKEN_EXPIRED') {
      return NextResponse.json({ error: '인증 링크가 만료되었습니다. 다시 요청해 주세요.' }, { status: 400 });
    }
    if (code === 'TOKEN_USED') {
      return NextResponse.json({ error: '이미 사용된 인증 링크입니다.' }, { status: 400 });
    }
    console.error('Verify email error:', err);
    return NextResponse.json({ error: '이메일 인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
