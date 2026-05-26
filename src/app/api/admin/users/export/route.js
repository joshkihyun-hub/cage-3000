import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      zipCode: true,
      address: true,
      detailAddress: true,
      role: true,
      status: true,
      marketingConsent: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const headers = [
    'id',
    'name',
    'email',
    'phoneNumber',
    'zipCode',
    'address',
    'detailAddress',
    'role',
    'status',
    'marketingConsent',
    'orderCount',
    'loginCount',
    'lastLoginAt',
    'createdAt',
  ];

  const lines = [headers.join(',')];
  for (const u of users) {
    lines.push(
      [
        u.id,
        u.name,
        u.email,
        u.phoneNumber,
        u.zipCode,
        u.address,
        u.detailAddress,
        u.role,
        u.status,
        u.marketingConsent ? 'Y' : 'N',
        u._count.orders,
        u.loginCount,
        u.lastLoginAt ? u.lastLoginAt.toISOString() : '',
        u.createdAt.toISOString(),
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  // UTF-8 BOM so Excel opens Korean text correctly.
  const body = '﻿' + lines.join('\n');
  const filename = `cage3000-users-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
