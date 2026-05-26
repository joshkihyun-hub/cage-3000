import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeEmailToken } from '@/lib/email-tokens';
import { checkPasswordStrength } from '@/lib/validation';

export async function POST(req) {
  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 }); }

  const { token, password } = body || {};
  if (!token) {
    return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 });
  }
  const strength = checkPasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reasons.join(' ') }, { status: 400 });
  }

  try {
    const user = await consumeEmailToken({ token, purpose: 'password_reset' });
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      }),
      // 보안: 다른 모든 활성 비밀번호 재설정 토큰도 무효화
      prisma.emailToken.updateMany({
        where: { userId: user.id, purpose: 'password_reset', consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      // 보안: 기존 세션 모두 종료
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const code = err.message;
    if (code === 'TOKEN_INVALID') {
      return NextResponse.json({ error: '유효하지 않은 링크입니다.' }, { status: 400 });
    }
    if (code === 'TOKEN_EXPIRED') {
      return NextResponse.json({ error: '링크가 만료되었습니다. 비밀번호 재설정을 다시 요청해 주세요.' }, { status: 400 });
    }
    if (code === 'TOKEN_USED') {
      return NextResponse.json({ error: '이미 사용된 링크입니다.' }, { status: 400 });
    }
    console.error('Reset password error:', err);
    return NextResponse.json({ error: '비밀번호 재설정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
