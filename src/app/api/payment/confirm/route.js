import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { settleOrderPayment } from '@/lib/order-payment';

const GUEST_COOKIE = 'cage_guest_order';

// Parses the httpOnly guest cookie set by /api/orders.
// Format: `<orderId>:<token>`
function parseGuestCookie(req) {
  const raw = req.cookies.get(GUEST_COOKIE)?.value;
  if (!raw) return null;
  const idx = raw.indexOf(':');
  if (idx === -1) return null;
  return { orderId: raw.slice(0, idx), token: raw.slice(idx + 1) };
}

// POST /api/payment/confirm — client-driven settlement.
// Authorizes the caller (session or guest cookie), then defers the actual
// verify-and-transition to the shared, idempotent settleOrderPayment so this
// path and the webhook can never disagree. The webhook is the safety net for
// when this call never runs (redirect flows, browser closed mid-payment).
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id || null;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { paymentId } = body || {};
  // orderId is optional: the inline flow sends it, but the redirect flow only
  // has the PortOne paymentId — which equals our orderNumber, so we can resolve
  // the order either way.
  const orderId = body?.orderId || null;
  if (!paymentId) {
    return NextResponse.json({ message: 'paymentId가 누락되었습니다.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: orderId ? { id: orderId } : { orderNumber: paymentId },
    select: {
      id: true,
      userId: true,
      guestToken: true,
      status: true,
      totalAmount: true,
    },
  });

  if (!order) {
    return NextResponse.json({ message: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  // Authorization: the order must belong to either the current session,
  // or to the holder of the guest cookie issued at order-creation time.
  if (order.userId) {
    if (order.userId !== sessionUserId) {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }
  } else {
    const guest = parseGuestCookie(request);
    if (!guest || guest.orderId !== order.id || guest.token !== order.guestToken) {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }
  }

  const result = await settleOrderPayment({ order, paymentId });

  if (result.ok) {
    const res = NextResponse.json({
      status: 'success',
      message: result.alreadyPaid ? '이미 결제 완료된 주문입니다.' : '결제가 완료되었습니다.',
    });
    // Clear the guest cookie now that the order has settled.
    if (!order.userId) res.cookies.delete(GUEST_COOKIE);
    return res;
  }

  // Map settlement failures to client responses.
  switch (result.status) {
    case 'failed':
      return NextResponse.json(
        { status: 'failed', message: `결제가 완료되지 않았습니다. (${result.code})` },
        { status: 400 }
      );
    case 'mismatch':
      return NextResponse.json(
        { message: '결제 금액이 일치하지 않아 자동 취소되었습니다. 다시 시도해 주세요.' },
        { status: 400 }
      );
    case 'conflict':
      return NextResponse.json(
        { message: `결제할 수 없는 주문 상태입니다. (${result.code})` },
        { status: 400 }
      );
    default:
      return NextResponse.json(
        { message: result.code === 'config' ? '결제 설정 오류' : '결제 검증 중 오류가 발생했습니다.' },
        { status: 500 }
      );
  }
}
