import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { listSubscribers } from '@/lib/subscribers';

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // =, +, -, @로 시작하면 엑셀이 수식으로 실행한다 — 앞에 '를 붙여 글자로만.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// GET /api/admin/subscribers — Field Notes 구독자(DB). ?format=csv면 내려받기.
export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  let subscribers;
  try {
    subscribers = await listSubscribers();
  } catch (err) {
    console.error('[admin/subscribers] list failed', { message: err?.message });
    return NextResponse.json(
      { error: '구독자 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' },
      { status: 502 }
    );
  }

  if (new URL(req.url).searchParams.get('format') === 'csv') {
    const rows = [['email', 'subscribed_at', 'status']].concat(
      subscribers.map((s) => [s.email, s.createdAt, s.unsubscribed ? 'unsubscribed' : 'subscribed'])
    );
    const csv = '﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="field-notes-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ subscribers }, { headers: { 'Cache-Control': 'no-store' } });
}
