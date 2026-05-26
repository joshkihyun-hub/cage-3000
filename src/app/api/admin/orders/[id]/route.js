import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

const VALID_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];

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
    if (!VALID_STATUSES.includes(body.status)) {
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
    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
