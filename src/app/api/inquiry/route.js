import { NextResponse } from 'next/server';
import { sendCommissionInquiry } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const LIMITS = { name: 100, email: 200, organization: 200, message: 5000 };

// 한 줄 필드는 줄바꿈·탭을 공백으로 — 메일 제목에 들어가도 헤더가 깨지지 않게.
const line = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const block = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

// 프로젝트 페이지의 제작 문의 양식. 운영자 메일함으로만 보내고 문의자에게 자동 회신은
// 하지 않는다 — 임의 주소로 메일을 보내는 통로가 되지 않도록.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }

  // 봇만 채우는 숨은 칸. 채워져 있으면 보낸 척만 하고 끝낸다.
  if (body?.website) {
    return NextResponse.json({ status: 'ok' });
  }

  const name = line(body?.name, LIMITS.name);
  const email = line(body?.email, LIMITS.email).toLowerCase();
  const organization = line(body?.organization, LIMITS.organization);
  const message = block(body?.message, LIMITS.message);

  if (!name) return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: '이메일 주소를 확인해 주세요.' }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: '문의 내용을 조금 더 적어 주세요.' }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ error: '개인정보 수집·이용에 동의해 주세요.' }, { status: 400 });

  const limit = await rateLimit(`inquiry:ip:${getClientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter ?? 60) } }
    );
  }

  try {
    await sendCommissionInquiry({ name, email, organization, message });
  } catch (err) {
    console.error('[inquiry] email send failed', { message: err?.message, name: err?.name });
    return NextResponse.json(
      { error: '전송에 실패했어요. contact@cage3000.com 으로 직접 보내 주세요.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ status: 'ok' });
}
