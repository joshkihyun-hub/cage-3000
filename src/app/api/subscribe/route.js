import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/subscribers';
import { isValidEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// 푸터의 작업 소식(Field Notes) 구독. 확인 메일을 따로 보내지 않는다 — 임의 주소로 메일을
// 보내는 통로가 되지 않도록. 광고성 정보 수신 동의(consent)는 필수.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }

  // 봇만 채우는 숨은 칸 — 채워져 있으면 성공한 척만 한다.
  if (body?.website) return NextResponse.json({ status: 'ok' });

  const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 200);
  if (!isValidEmail(email)) return NextResponse.json({ error: '이메일 주소를 확인해 주세요.' }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ error: '수신 동의에 체크해 주세요.' }, { status: 400 });

  const limit = await rateLimit(`subscribe:ip:${getClientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter ?? 60) } }
    );
  }

  try {
    await addSubscriber(email);
  } catch (err) {
    console.error('[subscribe] failed', { message: err?.message, name: err?.name });
    return NextResponse.json({ error: '지금은 신청을 받을 수 없어요. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
  }
  return NextResponse.json({ status: 'ok' });
}
