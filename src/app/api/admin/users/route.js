import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

// GET /api/admin/users
// Query params:
//   q          - search (name / email / phoneNumber)
//   role       - 'user' | 'admin'
//   status     - 'active' | 'suspended' | 'withdrawn'
//   marketing  - 'true' | 'false'
//   page       - 1-indexed, default 1
//   pageSize   - default 20, max 100
//   sort       - 'createdAt' | 'lastLoginAt' | 'name' (default 'createdAt')
//   order      - 'asc' | 'desc' (default 'desc')
export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const marketing = searchParams.get('marketing');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20)
  );
  const sortField = ['createdAt', 'lastLoginAt', 'name'].includes(searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  const where = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phoneNumber: { contains: q } },
    ];
  }
  if (role && ['user', 'admin'].includes(role)) where.role = role;
  if (status && ['active', 'suspended', 'withdrawn'].includes(status)) where.status = status;
  if (marketing === 'true') where.marketingConsent = true;
  if (marketing === 'false') where.marketingConsent = false;

  const [total, users, stats] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sortField]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        detailAddress: true,
        zipCode: true,
        marketingConsent: true,
        status: true,
        role: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const summary = {
    total,
    byStatus: stats.reduce((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {}),
  };

  return NextResponse.json({
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary,
  });
}
