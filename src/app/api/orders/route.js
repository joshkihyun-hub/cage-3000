import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveUser } from '@/lib/auth-guards';
import { getProductById, getProductUnitPrice, generateOrderNumber } from '@/lib/catalog';
import { isValidKrPhone } from '@/lib/validation';

// POST /api/orders — create a pending Order from a cart + shipping info.
// Returns { orderId, orderNumber, totalAmount } so the client can hand them
// to PortOne. Pricing is computed server-side; client cart prices are ignored.
export async function POST(req) {
  const { session, user, error } = await requireActiveUser();
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { items, shipping } = body || {};

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

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
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
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: '주문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET /api/orders — current user's own order history.
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
