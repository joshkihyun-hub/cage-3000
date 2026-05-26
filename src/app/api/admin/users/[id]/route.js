import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

export async function GET(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      detailAddress: true,
      zipCode: true,
      birthDate: true,
      marketingConsent: true,
      termsAgreedAt: true,
      privacyAgreedAt: true,
      marketingAgreedAt: true,
      lastLoginAt: true,
      loginCount: true,
      status: true,
      adminNote: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          currency: true,
          paymentMethod: true,
          paidAt: true,
          createdAt: true,
          items: {
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const orderStats = await prisma.order.aggregate({
    where: { userId: id, status: { in: ['paid', 'preparing', 'shipped', 'delivered'] } },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });

  return NextResponse.json({
    user,
    stats: {
      lifetimeOrders: orderStats._count._all,
      lifetimeRevenue: orderStats._sum.totalAmount || 0,
    },
  });
}

const ALLOWED_STATUS = new Set(['active', 'suspended', 'withdrawn']);
const ALLOWED_ROLES = new Set(['user', 'admin']);

export async function PATCH(req, { params }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.role !== undefined) {
    if (!ALLOWED_ROLES.has(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // Prevent admins from demoting themselves (could lock everyone out).
    if (id === session.user.id && body.role !== 'admin') {
      return NextResponse.json(
        { error: '본인의 admin 권한은 해제할 수 없습니다.' },
        { status: 400 }
      );
    }
    data.role = body.role;
  }

  if (body.adminNote !== undefined) {
    data.adminNote = typeof body.adminNote === 'string' ? body.adminNote.slice(0, 2000) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        status: true,
        role: true,
        adminNote: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error('User update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
