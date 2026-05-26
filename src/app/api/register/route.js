import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  isValidEmail,
  isValidKrPhone,
  formatKrPhone,
  checkPasswordStrength,
} from '@/lib/validation';
import { issueEmailToken } from '@/lib/email-tokens';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const {
    name,
    phoneNumber,
    email,
    address,
    detailAddress,
    zipCode,
    marketingConsent = false,
    termsAgreed = false,
    privacyAgreed = false,
    password,
  } = body;

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: '이름은 2자 이상이어야 합니다.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '올바른 이메일을 입력해 주세요.' }, { status: 400 });
  }
  if (!isValidKrPhone(phoneNumber)) {
    return NextResponse.json(
      { error: '올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)' },
      { status: 400 }
    );
  }
  const strength = checkPasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reasons.join(' ') }, { status: 400 });
  }
  if (!termsAgreed || !privacyAgreed) {
    return NextResponse.json(
      { error: '이용약관 및 개인정보 처리방침에 동의해 주세요.' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = formatKrPhone(phoneNumber);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }],
    },
    select: { email: true, phoneNumber: true },
  });

  if (existing) {
    if (existing.email === normalizedEmail) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.', field: 'email' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: '이미 가입된 휴대폰 번호입니다.', field: 'phoneNumber' },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date();

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        hashedPassword,
        phoneNumber: normalizedPhone,
        address: address?.trim() || null,
        detailAddress: detailAddress?.trim() || null,
        zipCode: zipCode?.trim() || null,
        marketingConsent: Boolean(marketingConsent),
        termsAgreedAt: now,
        privacyAgreedAt: now,
        marketingAgreedAt: marketingConsent ? now : null,
      },
      select: { id: true, name: true, email: true },
    });

    // 메일 발송은 실패해도 가입 자체는 성공시킨다 — 사용자가 추후 재발송하면 됨.
    // 단, 진단을 위해 자세한 에러 정보를 Vercel logs에 남긴다.
    try {
      const token = await issueEmailToken({ userId: user.id, purpose: 'email_verify' });
      await sendVerificationEmail({ to: user.email, name: user.name, token });
      console.log(`[register] verification email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('[register] verification email failed for', user.email, {
        message: emailErr?.message,
        stack: emailErr?.stack,
        name: emailErr?.name,
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
