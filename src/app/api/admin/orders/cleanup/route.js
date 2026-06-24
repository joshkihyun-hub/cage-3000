import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

// POST /api/admin/orders/cleanup — sweep abandoned pending orders to `failed`.
//
// A `pending` order is just a draft created right before payment. When payment
// never completes (user bailed, tab closed), it lingers forever and clutters
// the order list / pending counts. This marks ones older than `olderThanHours`
// (default 24h) as `failed`. Status-only change, fully reversible by an admin.
export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }

  const hours = Number(body?.olderThanHours);
  const olderThanHours = Number.isFinite(hours) && hours > 0 ? Math.min(hours, 24 * 30) : 24;
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const result = await prisma.order.updateMany({
    where: { status: 'pending', createdAt: { lt: cutoff } },
    data: { status: 'failed' },
  });

  return NextResponse.json({ updated: result.count, olderThanHours });
}
