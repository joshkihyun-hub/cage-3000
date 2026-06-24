'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ORDER_STATUS_LABEL } from '@/lib/order-status';

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('ko-KR');
  } catch {
    return '-';
  }
}

export default function OrderLookupPage() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), orderNumber: orderNumber.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '조회에 실패했습니다.');
      setOrder(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tracking =
    order && order.trackingNumber
      ? `${order.trackingCarrier || ''} ${order.trackingNumber}`.trim()
      : null;

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm">
        <h1 className="text-3xl md:text-4xl text-center mb-3 text-black uppercase">
          Order Lookup
        </h1>
        <p className="text-center text-[11px] text-zinc-500 mb-12">
          비회원 주문 조회 · 주문 시 입력한 이메일과 주문번호를 입력해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mb-10">
          <input
            type="email"
            autoComplete="email"
            className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
            placeholder="이메일 (you@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
            placeholder="주문번호 (ORD-20260101-XXXXXX)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            {loading ? '조회 중…' : '주문 조회'}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 py-3 mb-8">
            {error}
          </p>
        )}

        {order && (
          <div className="border-t border-zinc-200 pt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-1">
                  Order Number
                </p>
                <p className="text-sm text-black tracking-wide font-mono">{order.orderNumber}</p>
              </div>
              <span className="inline-block px-3 py-1 text-[11px] uppercase tracking-widest border border-zinc-200 text-zinc-700">
                {ORDER_STATUS_LABEL[order.status] || order.status}
              </span>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Items</p>
              <ul className="space-y-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-zinc-100 pb-3">
                    <span className="text-zinc-700">
                      {item.productName} <span className="text-zinc-400">× {item.quantity}</span>
                    </span>
                    <span className="text-zinc-600">{formatKRW(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-base pt-4 font-medium">
                <span>합계</span>
                <span>{formatKRW(order.totalAmount)}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Timeline</p>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <Row label="주문일" value={formatDate(order.createdAt)} />
                <Row label="결제일" value={formatDate(order.paidAt)} />
                <Row label="발송일" value={formatDate(order.shippedAt)} />
                <Row label="배송완료" value={formatDate(order.deliveredAt)} />
              </dl>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-2">Tracking</p>
              <p className="text-sm text-zinc-700">{tracking || '아직 운송장이 등록되지 않았습니다.'}</p>
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-[10px] text-zinc-400 leading-relaxed">
          회원이신가요?{' '}
          <Link href="/my-page" className="underline hover:text-black transition-colors">
            마이페이지에서 주문 내역 보기
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1">{label}</dt>
      <dd className="text-sm text-zinc-800">{value}</dd>
    </div>
  );
}
