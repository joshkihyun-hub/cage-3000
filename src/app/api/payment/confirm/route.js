import { NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { prisma } from '@/lib/prisma';
import { requireActiveUser } from '@/lib/auth-guards';

export async function POST(request) {
  const { session, error } = await requireActiveUser();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { paymentId, orderId } = body || {};
  if (!paymentId || !orderId) {
    return NextResponse.json(
      { message: 'paymentId 또는 orderId가 누락되었습니다.' },
      { status: 400 }
    );
  }

  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    console.error('PORTONE_API_SECRET is not configured');
    return NextResponse.json({ message: '결제 설정 오류' }, { status: 500 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      totalAmount: true,
      currency: true,
      paymentId: true,
    },
  });

  if (!order) {
    return NextResponse.json({ message: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
  }
  if (order.status === 'paid') {
    return NextResponse.json({ status: 'success', message: '이미 결제 완료된 주문입니다.' });
  }
  if (order.status !== 'pending') {
    return NextResponse.json(
      { message: `결제할 수 없는 주문 상태입니다. (${order.status})` },
      { status: 400 }
    );
  }

  try {
    const portoneClient = new PortOneClient({ apiSecret });
    const payment = await portoneClient.payments.get(paymentId);

    if (!payment) {
      return NextResponse.json({ message: '결제 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (payment.status !== 'PAID') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' },
      });
      return NextResponse.json(
        { status: 'failed', message: `결제 상태: ${payment.status}` },
        { status: 400 }
      );
    }

    const paidAmount = payment.amount?.total ?? payment.totalAmount;
    if (Number(paidAmount) !== Number(order.totalAmount)) {
      console.error('Payment amount mismatch', {
        orderId: order.id,
        expected: order.totalAmount,
        got: paidAmount,
      });
      return NextResponse.json(
        { message: '결제 금액이 일치하지 않습니다. 관리자에게 문의해 주세요.' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentId,
        paymentMethod: payment.method?.type || payment.channel?.type || null,
      },
      select: { id: true, orderNumber: true, totalAmount: true, paidAt: true },
    });

    return NextResponse.json({
      status: 'success',
      message: '결제가 완료되었습니다.',
      order: updated,
    });
  } catch (err) {
    console.error('PortOne verification error:', err);
    return NextResponse.json({ message: '결제 검증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
