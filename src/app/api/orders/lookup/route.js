import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/orders/lookup — guest order-status lookup by email + orderNumber.
//
// Public (no auth): guests have no account, so they verify ownership with the
// two factors they were given at checkout. Returns only safe, customer-facing
// fields. Any mismatch returns a generic 404 so the endpoint can't be used to
// probe which orders/emails exist. Rate-limited to blunt enumeration.
export async function POST(req) {
  const limited = rateLimit(`lookup:${getClientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const orderNumber = String(body?.orderNumber || '').trim();
  if (!isValidEmail(email) || !orderNumber) {
    return NextResponse.json(
      { error: '이메일과 주문번호를 정확히 입력해 주세요.' },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
      paidAt: true,
      shippedAt: true,
      deliveredAt: true,
      trackingCarrier: true,
      trackingNumber: true,
      recipientName: true,
      guestEmail: true,
      user: { select: { email: true } },
      items: { select: { productName: true, quantity: true, subtotal: true } },
    },
  });

  // Match against the guest email or the owning member's email. Generic 404 on
  // any miss — never reveal whether the orderNumber or the email existed.
  const ownerEmail = (order?.guestEmail || order?.user?.email || '').toLowerCase();
  if (!order || !ownerEmail || ownerEmail !== email) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다. 이메일과 주문번호를 확인해 주세요.' },
      { status: 404 }
    );
  }

  // Return only customer-facing fields (omit guestEmail / linked user).
  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      trackingCarrier: order.trackingCarrier,
      trackingNumber: order.trackingNumber,
      recipientName: order.recipientName,
      items: order.items,
    },
  });
}
