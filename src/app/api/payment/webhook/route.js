import { NextResponse } from 'next/server';
import { Webhook } from '@portone/server-sdk';
import { prisma } from '@/lib/prisma';
import { getPortOneClient, settleOrderPayment } from '@/lib/order-payment';
import { REVENUE_STATUSES } from '@/lib/order-status';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/payment/webhook — PortOne payment lifecycle webhook.
//
// This is the safety net for payment integrity: even if the client never calls
// /api/payment/confirm (mobile/easy-pay redirect, browser closed mid-flow,
// network drop), the order still settles here. Settlement goes through the
// shared, idempotent settleOrderPayment, so client + webhook can never disagree
// or double-send emails.
//
// 웹훅 본문은 "어느 결제를 다시 볼지" 알려 주는 신호로만 쓴다. 주문 상태는 언제나 포트원 API로
// 결제를 다시 조회해(서버의 PORTONE_API_SECRET) 확인한 뒤에만 바꾼다 — 그래서 누가 가짜 웹훅을
// 보내도 할 수 있는 건 "다시 확인해 봐"뿐이다. PORTONE_WEBHOOK_SECRET이 있으면 서명도 검사해
// 가짜 요청을 입구에서 막고, 없으면 IP당 횟수만 묶고 받는다.
//
// Setup: register `https://<domain>/api/payment/webhook` in the PortOne console
// (결제모듈 V2, 실연동). The webhook secret is optional (see above).
export async function POST(req) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;

  // Signature verification needs the exact raw body.
  const rawBody = await req.text();

  let event;
  if (secret) {
    try {
      event = await Webhook.verify(secret, rawBody, {
        'webhook-id': req.headers.get('webhook-id') ?? undefined,
        'webhook-timestamp': req.headers.get('webhook-timestamp') ?? undefined,
        'webhook-signature': req.headers.get('webhook-signature') ?? undefined,
      });
    } catch (err) {
      console.error('[webhook] signature verification failed', err?.message);
      return NextResponse.json({ message: 'invalid signature' }, { status: 400 });
    }
  } else {
    // 매 요청이 포트원 API 조회로 이어지므로, 한 곳에서 쏟아지는 요청이 연동 한도를 쓰지 못하게.
    const limited = await rateLimit(`webhook:${getClientIp(req)}`, { limit: 60, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { message: 'too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: 'invalid body' }, { status: 400 });
    }
  }

  const type = event?.type;
  const paymentId = event?.data?.paymentId;
  // Only transaction events carry a paymentId we act on. Ack everything else.
  if (!type || typeof paymentId !== 'string' || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    // paymentId === our orderNumber (set as the PortOne paymentId at checkout).
    const order = await prisma.order.findUnique({
      where: { orderNumber: paymentId },
      select: { id: true, status: true, totalAmount: true },
    });
    if (!order) {
      // Unknown order — ack so PortOne stops retrying, but log for visibility.
      console.warn('[webhook] no matching order', { type, paymentId });
      return NextResponse.json({ ok: true });
    }

    if (type === 'Transaction.Paid') {
      // settleOrderPayment re-fetches the payment from PortOne and checks the amount.
      const result = await settleOrderPayment({ order, paymentId });
      // Transient states → 500 so PortOne retries; terminal outcomes ack.
      // 'processing' means the PG hadn't finalized when we looked it up —
      // retrying is what eventually settles the order.
      if (!result.ok && (result.status === 'error' || result.status === 'processing')) {
        return NextResponse.json({ message: 'retry' }, { status: 500 });
      }
    } else if (type === 'Transaction.Cancelled') {
      // Operator refunded/cancelled in the PortOne console → sync the DB, but only
      // once PortOne itself says the payment is fully cancelled (부분 취소는 그대로 둔다).
      const client = getPortOneClient();
      if (!client) {
        console.error('[webhook] PORTONE_API_SECRET is not configured');
        return NextResponse.json({ message: 'retry' }, { status: 500 });
      }
      const payment = await client.payment.getPayment({ paymentId });
      if (payment?.status === 'CANCELLED') {
        // Only touch orders that were actually paid; leave failed/pending alone.
        await prisma.order.updateMany({
          where: { id: order.id, status: { in: REVENUE_STATUSES } },
          data: { status: 'refunded', cancelledAt: new Date() },
        });
      }
    }
    // Other events (Ready / VirtualAccountIssued / Failed / ...) are ignored.
  } catch (err) {
    console.error('[webhook] processing error', { type, paymentId, message: err?.message });
    // 500 → PortOne retries. settleOrderPayment is idempotent, so retrying is safe.
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
