import { PortOneClient } from '@portone/server-sdk';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderNotificationToSeller } from '@/lib/email';

// Shared payment-settlement core, used by BOTH the client confirm route
// (/api/payment/confirm) and the PortOne webhook (/api/payment/webhook).
// Centralizing it guarantees the two paths verify and transition orders
// identically and idempotently.

let cachedClient = null;

// PortOne V2 server SDK: `PortOneClient` is a factory (call WITHOUT `new`) and
// the init key is `secret` (not `apiSecret`). The payment client is exposed at
// `client.payment` with `getPayment`/`cancelPayment` taking an options object.
export function getPortOneClient() {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return null;
  if (!cachedClient) cachedClient = PortOneClient({ secret });
  return cachedClient;
}

// PortOne method types look like "PaymentMethodCard" / "PaymentMethodEasyPay".
// Strip the prefix for a tidy value to store/display ("Card", "EasyPay", ...).
function describePaymentMethod(payment) {
  const type = payment?.method?.type;
  if (type) return String(type).replace(/^PaymentMethod/, '') || null;
  return payment?.channel?.type || null;
}

// Order statuses that a Transaction.Paid may legitimately transition to `paid`.
// `failed` is included as a recovery path: if we ever marked an order failed
// while the PG was still processing (or a webhook raced us), a later PAID
// verification must still settle it — the customer's money was captured.
const SETTLEABLE_STATUSES = ['pending', 'failed'];

// PortOne payment statuses that mean "not paid and never will be".
// Everything else non-PAID (READY, PENDING, VIRTUAL_ACCOUNT_ISSUED, ...)
// is still in flight and must NOT flip the order to failed.
const TERMINAL_FAILURE_STATUSES = ['FAILED', 'CANCELLED', 'PARTIAL_CANCELLED'];

/**
 * Verifies a PortOne payment and atomically settles the order to `paid`.
 * Idempotent — concurrent callers (client + webhook, double-clicks) are safe.
 *
 * @param {{ order: { id: string, status: string, totalAmount: number }, paymentId: string }} args
 * @returns {Promise<{ ok: boolean, status: 'success'|'failed'|'mismatch'|'conflict'|'processing'|'error', code?: string, alreadyPaid?: boolean }>}
 */
export async function settleOrderPayment({ order, paymentId }) {
  if (!order || !paymentId) return { ok: false, status: 'error', code: 'bad_input' };

  // Fast idempotency: already settled, or no longer settleable.
  if (order.status === 'paid') return { ok: true, status: 'success', alreadyPaid: true };
  if (!SETTLEABLE_STATUSES.includes(order.status)) {
    return { ok: false, status: 'conflict', code: order.status };
  }

  const client = getPortOneClient();
  if (!client) {
    console.error('[settle] PORTONE_API_SECRET is not configured');
    return { ok: false, status: 'error', code: 'config' };
  }

  let payment;
  try {
    payment = await client.payment.getPayment({ paymentId });
  } catch (err) {
    console.error('[settle] getPayment failed', { paymentId, message: err?.message });
    return { ok: false, status: 'error', code: 'lookup_failed' };
  }
  if (!payment) return { ok: false, status: 'error', code: 'not_found' };

  if (payment.status !== 'PAID') {
    // Still in flight at the PG (READY / PENDING / ...): leave the order as-is
    // and report `processing` — the webhook (or a confirm retry) settles later.
    // Flipping to failed here would strand a payment that succeeds moments after.
    if (!TERMINAL_FAILURE_STATUSES.includes(payment.status)) {
      return { ok: false, status: 'processing', code: payment.status };
    }
    // Terminally not paid — record it so the order doesn't linger as pending.
    await prisma.order.updateMany({
      where: { id: order.id, status: 'pending' },
      data: { status: 'failed' },
    });
    return { ok: false, status: 'failed', code: payment.status };
  }

  // Tamper check: the captured amount must match our server-side price. On a
  // mismatch, auto-cancel via PortOne so the customer isn't left charged, then
  // fail the order. (Previously this just returned 400 and left it pending.)
  const paidAmount = Number(payment.amount?.total);
  if (!Number.isFinite(paidAmount) || paidAmount !== Number(order.totalAmount)) {
    console.error('[settle] amount mismatch', {
      orderId: order.id,
      expected: order.totalAmount,
      got: payment.amount?.total,
    });
    try {
      await client.payment.cancelPayment({ paymentId, reason: '주문 금액 불일치 자동 취소' });
    } catch (cancelErr) {
      console.error('[settle] auto-cancel failed', { paymentId, message: cancelErr?.message });
    }
    await prisma.order.updateMany({
      where: { id: order.id, status: { in: SETTLEABLE_STATUSES } },
      data: { status: 'failed' },
    });
    return { ok: false, status: 'mismatch' };
  }

  // Atomic pending/failed -> paid. The conditional `where` means only the first
  // concurrent caller flips it (count === 1); any other sees count === 0 and
  // skips the email, so confirmations never double-send.
  const result = await prisma.order.updateMany({
    where: { id: order.id, status: { in: SETTLEABLE_STATUSES } },
    data: {
      status: 'paid',
      paidAt: new Date(),
      paymentId,
      paymentMethod: describePaymentMethod(payment),
    },
  });

  if (result.count === 0) {
    return { ok: true, status: 'success', alreadyPaid: true };
  }

  // We own the transition — send order emails AFTER the response is flushed so
  // payment confirmation never blocks on (or fails because of) email delivery.
  after(() => sendOrderEmails(order.id));

  return { ok: true, status: 'success' };
}

/**
 * Sends the buyer receipt + seller notification for a settled order.
 * Each send is isolated so one failing address never blocks the other.
 * Safe to call fire-and-forget.
 */
export async function sendOrderEmails(orderId) {
  let order;
  try {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        totalAmount: true,
        paymentMethod: true,
        paidAt: true,
        guestEmail: true,
        userId: true,
        recipientName: true,
        recipientPhone: true,
        shippingZipCode: true,
        shippingAddress: true,
        shippingDetail: true,
        customerNote: true,
        items: { select: { productName: true, quantity: true, subtotal: true } },
      },
    });
  } catch (err) {
    console.error('[settle] order email lookup failed', { orderId, message: err?.message });
    return;
  }
  if (!order) return;

  let buyerEmail = order.guestEmail;
  let buyerName = order.recipientName;
  if (!buyerEmail && order.userId) {
    const u = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true, name: true },
    });
    buyerEmail = u?.email || null;
    buyerName = u?.name || buyerName;
  }

  const shipping = {
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    zipCode: order.shippingZipCode,
    address: order.shippingAddress,
    detail: order.shippingDetail,
    customerNote: order.customerNote,
  };

  if (buyerEmail) {
    try {
      await sendOrderConfirmationEmail({
        to: buyerEmail,
        name: buyerName,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.items,
        shipping,
      });
    } catch (err) {
      console.error('[settle] buyer receipt failed', { orderId, message: err?.message });
    }
  }

  try {
    await sendOrderNotificationToSeller({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      isGuest: !order.userId,
      buyer: { name: buyerName, email: buyerEmail, phone: order.recipientPhone },
      shipping,
      items: order.items,
    });
  } catch (err) {
    console.error('[settle] seller notification failed', { orderId, message: err?.message });
  }
}
