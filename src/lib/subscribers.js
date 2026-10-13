import { prisma } from '@/lib/prisma';
import { addResendContact } from '@/lib/email';

// 작업 소식(Field Notes) 구독자 — 신청하는 순간 DB에 저장되고, 관리자 화면(/admin/subscribers)이 이걸 읽는다.
// 해지했던 주소가 다시 신청하면 구독 상태로 되돌린다(신청일은 처음 그대로).
export async function addSubscriber(email) {
  await prisma.subscriber.upsert({
    where: { email },
    create: { email },
    update: { unsubscribedAt: null },
  });
  await addResendContact(email);
}

// 최근 신청이 위로.
export async function listSubscribers() {
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 });
  return rows.map((r) => ({
    email: r.email,
    createdAt: r.createdAt.toISOString(),
    unsubscribed: Boolean(r.unsubscribedAt),
  }));
}
