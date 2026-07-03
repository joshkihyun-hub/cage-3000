import { NextResponse } from 'next/server';
import { Webhook } from '@portone/server-sdk';
import { prisma } from '@/lib/prisma';
import { settleOrderPayment } from '@/lib/order-payment';
import { REVENUE_STATUSES } from '@/lib/order-status';

// POST /api/payment/webhook — PortOne payment lifecycle webhook.
//
// This is the safety net for payment integrity: even if the client never calls
// /api/payment/confirm (mobile/easy-pay redirect, browser closed mid-flow,
// network drop), the order still settles here. Settlement goes through the
// shared, idempotent settleOrderPayment, so client + webhook can never disagree
// or double-send emails.
//
// Setup: register `https://<domain>/api/payment/webhook` in the PortOne console
// and put the issued secret in PORTONE_WEBHOOK_SECRET.
export async function POST(req) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] PORTONE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ message: 'webhook not configured' }, { status: 500 });
  }

  // Signature verification needs the exact raw body.
  const rawBody = await req.text();

  let event;
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

  const type = event?.type;
  const paymentId = event?.data?.paymentId;
  // Only transaction events carry a paymentId we act on. Ack everything else.
  if (!type || !paymentId) {
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
      const result = await settleOrderPayment({ order, paymentId });
      // Transient states → 500 so PortOne retries; terminal outcomes ack.
      // 'processing' means the PG hadn't finalized when we looked it up —
      // retrying is what eventually settles the order.
      if (!result.ok && (result.status === 'error' || result.status === 'processing')) {
        return NextResponse.json({ message: 'retry' }, { status: 500 });
      }
    } else if (type === 'Transaction.Cancelled') {
      // Operator refunded/cancelled in the PortOne console → sync the DB.
      // Only touch orders that were actually paid; leave failed/pending alone.
      await prisma.order.updateMany({
        where: { id: order.id, status: { in: REVENUE_STATUSES } },
        data: { status: 'refunded', cancelledAt: new Date() },
      });
    }
    // Other events (Ready / VirtualAccountIssued / Failed / ...) are ignored.
  } catch (err) {
    console.error('[webhook] processing error', { type, paymentId, message: err?.message });
    // 500 → PortOne retries. settleOrderPayment is idempotent, so retrying is safe.
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
