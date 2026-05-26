import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

const REVENUE_STATUSES = ['paid', 'preparing', 'shipped', 'delivered'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sevenDaysAgo = addDays(today, -7);
  const thirtyDaysAgo = addDays(today, -30);

  const paidFilter = { status: { in: REVENUE_STATUSES } };

  // Run all aggregates in parallel.
  const [
    todayAgg,
    yesterdayAgg,
    monthAgg,
    prevMonthAgg,
    lifetimeAgg,
    newUsers7d,
    newUsers30d,
    totalUsers,
    activeUsers,
    suspendedUsers,
    last30dOrders,
    last30dUsers,
    topProducts,
    statusCounts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { ...paidFilter, paidAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { ...paidFilter, paidAt: { gte: yesterday, lt: today } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { ...paidFilter, paidAt: { gte: monthStart } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { ...paidFilter, paidAt: { gte: prevMonthStart, lt: monthStart } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: paidFilter,
      _sum: { totalAmount: true },
      _count: { _all: true },
      _avg: { totalAmount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { status: 'suspended' } }),
    prisma.order.findMany({
      where: { ...paidFilter, paidAt: { gte: thirtyDaysAgo } },
      select: { paidAt: true, totalAmount: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { order: paidFilter },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  // Build 30-day daily series for revenue + signups
  const dailyRevenue = [];
  const dailySignups = [];
  for (let i = 29; i >= 0; i -= 1) {
    const day = addDays(today, -i);
    const next = addDays(day, 1);
    const dayKey = day.toISOString().slice(0, 10);
    const revenue = last30dOrders
      .filter((o) => o.paidAt && o.paidAt >= day && o.paidAt < next)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const signups = last30dUsers.filter(
      (u) => u.createdAt >= day && u.createdAt < next
    ).length;
    dailyRevenue.push({ date: dayKey, revenue });
    dailySignups.push({ date: dayKey, signups });
  }

  return NextResponse.json({
    today: {
      revenue: todayAgg._sum.totalAmount || 0,
      orders: todayAgg._count._all,
    },
    yesterday: {
      revenue: yesterdayAgg._sum.totalAmount || 0,
      orders: yesterdayAgg._count._all,
    },
    thisMonth: {
      revenue: monthAgg._sum.totalAmount || 0,
      orders: monthAgg._count._all,
    },
    prevMonth: {
      revenue: prevMonthAgg._sum.totalAmount || 0,
      orders: prevMonthAgg._count._all,
    },
    lifetime: {
      revenue: lifetimeAgg._sum.totalAmount || 0,
      orders: lifetimeAgg._count._all,
      averageOrder: Math.round(lifetimeAgg._avg.totalAmount || 0),
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      newLast7Days: newUsers7d,
      newLast30Days: newUsers30d,
    },
    orderStatuses: statusCounts.reduce((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {}),
    dailyRevenue,
    dailySignups,
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      unitsSold: p._sum.quantity || 0,
      revenue: p._sum.subtotal || 0,
    })),
  });
}
