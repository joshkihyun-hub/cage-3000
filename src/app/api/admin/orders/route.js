import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

const VALID_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
  const sort = ['createdAt', 'paidAt', 'totalAmount'].includes(searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  const where = {};
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { recipientName: { contains: q, mode: 'insensitive' } },
      { recipientPhone: { contains: q } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { guestEmail: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status && VALID_STATUSES.includes(status)) where.status = status;

  const [orders, total, statusGroups, revenueAgg] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        currency: true,
        paymentMethod: true,
        recipientName: true,
        recipientPhone: true,
        trackingNumber: true,
        trackingCarrier: true,
        createdAt: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        user: { select: { id: true, name: true, email: true } },
        guestEmail: true,
        items: { select: { productName: true, quantity: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: { in: ['paid', 'preparing', 'shipped', 'delivered'] } },
      _sum: { totalAmount: true },
    }),
  ]);

  const summary = {
    total,
    byStatus: statusGroups.reduce((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {}),
    lifetimeRevenue: revenueAgg._sum.totalAmount || 0,
  };

  return NextResponse.json({
    orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary,
  });
}
