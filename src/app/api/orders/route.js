import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { requireActiveUser } from '@/lib/auth-guards';
import { getProductById, getProductUnitPrice, generateOrderNumber } from '@/lib/catalog';
import { isValidEmail, isValidKrPhone } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Cookie that proves a logged-out client owns a freshly created order.
// Read by /api/payment/confirm to authorize the payment transition.
const GUEST_COOKIE = 'cage_guest_order';
const GUEST_COOKIE_MAX_AGE = 60 * 60; // 1 hour — long enough for any payment flow.

// POST /api/orders — create a pending Order from a cart + shipping info.
// Auth is OPTIONAL: logged-in users get their order linked to their account;
// guests must provide an email so we can send the receipt and look the order
// up later. Pricing is computed server-side; client cart prices are ignored.
export async function POST(req) {
  // Soft per-IP guard against draft-order spam (best-effort; see lib/rate-limit).
  const limited = rateLimit(`orders:${getClientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  const session = await getServerSession(authOptions);
  const isGuest = !session?.user?.id;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { items, shipping, guestEmail } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: '장바구니가 비어 있습니다.' }, { status: 400 });
  }

  if (!shipping || typeof shipping !== 'object') {
    return NextResponse.json({ error: '배송 정보가 필요합니다.' }, { status: 400 });
  }

  const recipientName = String(shipping.recipientName || '').trim();
  const recipientPhone = String(shipping.recipientPhone || '').trim();
  const shippingAddress = String(shipping.address || '').trim();
  const shippingDetail = String(shipping.detailAddress || '').trim();
  const shippingZipCode = String(shipping.zipCode || '').trim();
  const customerNote = String(shipping.customerNote || '').trim().slice(0, 500);

  if (recipientName.length < 2) {
    return NextResponse.json({ error: '수령인 이름을 입력해 주세요.' }, { status: 400 });
  }
  if (!isValidKrPhone(recipientPhone)) {
    return NextResponse.json({ error: '올바른 수령인 휴대폰을 입력해 주세요.' }, { status: 400 });
  }
  if (shippingAddress.length < 4) {
    return NextResponse.json({ error: '배송지 주소를 입력해 주세요.' }, { status: 400 });
  }

  // Guest: require a usable email for the receipt + order-status lookup.
  let normalizedGuestEmail = null;
  if (isGuest) {
    normalizedGuestEmail = String(guestEmail || '').trim().toLowerCase();
    if (!isValidEmail(normalizedGuestEmail)) {
      return NextResponse.json(
        { error: '비회원 주문은 이메일이 필요합니다. (영수증 및 주문 조회용)' },
        { status: 400 }
      );
    }
  }

  // If logged in, also confirm the account is in good standing — reuses
  // the same guard the previous version used, so suspended/withdrawn
  // accounts still can't place orders.
  if (!isGuest) {
    const { error: guardError } = await requireActiveUser();
    if (guardError) return guardError;
  }

  // Server-side price lookup
  const orderItemsData = [];
  let subtotal = 0;

  for (const raw of items) {
    const productId = raw?.id ?? raw?.productId;
    const quantity = Math.max(1, Math.min(99, Number(raw?.quantity) || 0));
    if (!productId || quantity <= 0) {
      return NextResponse.json({ error: '잘못된 주문 항목이 있습니다.' }, { status: 400 });
    }
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { error: `존재하지 않는 상품입니다. (#${productId})` },
        { status: 400 }
      );
    }
    const unitPrice = getProductUnitPrice(product);
    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json(
        { error: `가격이 책정되지 않은 상품이 포함되어 있습니다. (${product.name})` },
        { status: 400 }
      );
    }
    const lineSubtotal = unitPrice * quantity;
    subtotal += lineSubtotal;
    orderItemsData.push({
      productId: String(product.id),
      productName: product.name,
      productImage: product.imageUrl || null,
      unitPrice,
      quantity,
      subtotal: lineSubtotal,
    });
  }

  const shippingFee = 0; // 배송비 정책은 추후 결정. 0원으로 시작.
  const totalAmount = subtotal + shippingFee;

  let orderNumber = generateOrderNumber();
  // collision retry
  for (let i = 0; i < 3; i += 1) {
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (!exists) break;
    orderNumber = generateOrderNumber();
  }

  const guestToken = isGuest ? crypto.randomBytes(32).toString('hex') : null;

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: isGuest ? null : session.user.id,
        guestEmail: isGuest ? normalizedGuestEmail : null,
        guestToken,
        status: 'pending',
        currency: 'KRW',
        subtotal,
        shippingFee,
        totalAmount,
        recipientName,
        recipientPhone,
        shippingZipCode: shippingZipCode || null,
        shippingAddress,
        shippingDetail: shippingDetail || null,
        customerNote: customerNote || null,
        items: { create: orderItemsData },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
      },
    });

    const res = NextResponse.json(order, { status: 201 });

    // Bind the guest order to this browser via an httpOnly cookie. The
    // value is `<orderId>:<token>` — opaque to JS, validated server-side
    // in /api/payment/confirm.
    if (isGuest && guestToken) {
      res.cookies.set(GUEST_COOKIE, `${order.id}:${guestToken}`, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: GUEST_COOKIE_MAX_AGE,
      });
    }

    return res;
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: '주문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET /api/orders — current user's own order history (auth-only).
// Guest orders are not listed here; guests look orders up via email + orderNumber.
export async function GET() {
  const { session, error } = await requireActiveUser();
  if (error) return error;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return NextResponse.json(orders);
}
