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

// 관리자 화면 택배사 이름(order-detail-drawer의 CARRIERS) → 포트원 물류사 코드.
const ESCROW_LOGISTICS_COMPANY = {
  CJ대한통운: 'CJ',
  우체국: 'POST',
  한진택배: 'HANJIN',
  롯데택배: 'LOTTE',
  로젠택배: 'LOGEN',
  EMS: 'EMS',
  DHL: 'DHL',
};

// 에스크로 발송자 — 푸터의 사업장 정보와 같다.
const ESCROW_SENDER = {
  name: '케이에이치엔(KHN)',
  phoneNumber: '01048909497',
  address: { addressLine1: '서울특별시 서대문구 연희로11사길 13', addressLine2: '(연희동)' },
};

/**
 * 에스크로 결제(계좌이체)의 배송정보를 KCP에 등록하거나 고친다. 에스크로는 이 등록이 있어야
 * 구매확정·정산이 진행된다(KCP 약관: 결제일 포함 7영업일 안에 발송·등록).
 * 계좌이체가 아니거나 운송장이 비어 있으면 아무것도 하지 않고, 같은 운송장으로 다시 불러도 안전하다.
 *
 * @returns {Promise<'registered'|'updated'|null>} 실패하면 throw — 부른 쪽이 관리자에게 알린다.
 */
export async function syncEscrowLogistics(order) {
  if (order.paymentMethod !== 'Transfer' || !order.paymentId) return null;
  if (!order.trackingCarrier || !order.trackingNumber) return null;

  const company = ESCROW_LOGISTICS_COMPANY[order.trackingCarrier];
  if (!company) throw new Error(`${order.trackingCarrier}은(는) 에스크로에 등록할 수 없는 택배사입니다.`);

  const client = getPortOneClient();
  if (!client) throw new Error('PORTONE_API_SECRET이 설정되지 않았습니다.');

  const payment = await client.payment.getPayment({ paymentId: order.paymentId });
  const escrow = payment?.escrow;
  // 에스크로 없이 결제된 건, 또는 배송완료·구매확정·취소처럼 등록 단계를 지난 건.
  if (!escrow || !['BEFORE_REGISTERED', 'REGISTERED'].includes(escrow.status)) return null;
  if (escrow.status === 'REGISTERED' && escrow.invoiceNumber === order.trackingNumber) return null;

  const options = {
    paymentId: order.paymentId,
    sender: ESCROW_SENDER,
    receiver: {
      name: order.recipientName,
      phoneNumber: order.recipientPhone.replace(/\D/g, ''),
      zipcode: order.shippingZipCode || undefined,
      address: { addressLine1: order.shippingAddress, addressLine2: order.shippingDetail || '' },
    },
    logistics: {
      company,
      invoiceNumber: order.trackingNumber,
      sentAt: new Date(order.shippedAt || Date.now()).toISOString(),
    },
  };
  if (escrow.status === 'BEFORE_REGISTERED') {
    await client.payment.applyEscrowLogistics(options);
    return 'registered';
  }
  await client.payment.modifyEscrowLogistics(options);
  return 'updated';
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
        isGuest: !order.userId,
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
