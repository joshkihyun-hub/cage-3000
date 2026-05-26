import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveUser } from '@/lib/auth-guards';
import { formatKrPhone, isValidKrPhone } from '@/lib/validation';

export async function POST(req) {
  const { session, error } = await requireActiveUser();
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const data = {};

  if (typeof body.name === 'string') {
    const trimmed = body.name.trim();
    if (trimmed.length < 2) {
      return NextResponse.json({ error: '이름은 2자 이상이어야 합니다.' }, { status: 400 });
    }
    data.name = trimmed;
  }

  if (typeof body.phoneNumber === 'string') {
    const formatted = formatKrPhone(body.phoneNumber);
    if (!isValidKrPhone(formatted)) {
      return NextResponse.json(
        { error: '올바른 휴대폰 번호를 입력해 주세요.' },
        { status: 400 }
      );
    }
    // 다른 사용자가 같은 번호를 쓰고 있는지 확인
    const existing = await prisma.user.findFirst({
      where: { phoneNumber: formatted, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 휴대폰 번호입니다.' },
        { status: 409 }
      );
    }
    data.phoneNumber = formatted;
  }

  if (typeof body.address === 'string') data.address = body.address.trim() || null;
  if (typeof body.detailAddress === 'string') data.detailAddress = body.detailAddress.trim() || null;
  if (typeof body.zipCode === 'string') data.zipCode = body.zipCode.trim() || null;
  if (typeof body.marketingConsent === 'boolean') {
    data.marketingConsent = body.marketingConsent;
    if (body.marketingConsent) data.marketingAgreedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '변경할 항목이 없습니다.' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        detailAddress: true,
        zipCode: true,
        marketingConsent: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('User update error:', err);
    return NextResponse.json({ error: '프로필 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
