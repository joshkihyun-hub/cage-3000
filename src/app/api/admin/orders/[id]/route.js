import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { isValidOrderStatus } from '@/lib/order-status';
import { sendOrderProgressEmail } from '@/lib/email';

export async function GET(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, paidAt: true, shippedAt: true, deliveredAt: true, cancelledAt: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const data = {};

  if (body.status !== undefined) {
    if (!isValidOrderStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
    // Auto-stamp transition timestamps so the order timeline is honest.
    const now = new Date();
    if (body.status === 'shipped' && !existing.shippedAt) data.shippedAt = now;
    if (body.status === 'delivered' && !existing.deliveredAt) data.deliveredAt = now;
    if (body.status === 'cancelled' && !existing.cancelledAt) data.cancelledAt = now;
    if (body.status === 'paid' && !existing.paidAt) data.paidAt = now;
  }

  if (body.trackingCarrier !== undefined) {
    data.trackingCarrier = typeof body.trackingCarrier === 'string' && body.trackingCarrier.trim()
      ? body.trackingCarrier.trim().slice(0, 60)
      : null;
  }
  if (body.trackingNumber !== undefined) {
    data.trackingNumber = typeof body.trackingNumber === 'string' && body.trackingNumber.trim()
      ? body.trackingNumber.trim().slice(0, 80)
      : null;
  }
  if (body.adminNote !== undefined) {
    data.adminNote = typeof body.adminNote === 'string' ? body.adminNote.slice(0, 2000) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    // '제작 중' · '배송 중'으로 넘어가는 순간에만 고객에게 진행 알림을 보낸다(같은 상태로 다시 저장하면 안 감).
    // 메일이 실패해도 상태 변경은 유지하고, 관리자 화면에 결과만 알린다.
    let notified = null;
    let notifyError = null;
    const becameProgress =
      data.status && data.status !== existing.status && ['preparing', 'shipped'].includes(data.status);
    if (becameProgress) {
      const to = updated.user?.email || updated.guestEmail;
      if (!to) {
        notifyError = '고객 이메일이 없어 알림을 보내지 못했습니다.';
      } else {
        try {
          await sendOrderProgressEmail({
            to,
            name: updated.user?.name || updated.recipientName,
            orderNumber: updated.orderNumber,
            status: data.status,
            trackingCarrier: updated.trackingCarrier,
            trackingNumber: updated.trackingNumber,
            isGuest: !updated.userId,
          });
          notified = data.status;
        } catch (mailErr) {
          console.error('[admin/orders] progress email failed', { orderNumber: updated.orderNumber, message: mailErr?.message });
          notifyError = '상태는 저장됐지만 알림 메일 발송에 실패했습니다.';
        }
      }
    }

    return NextResponse.json({ order: updated, notified, notifyError });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
