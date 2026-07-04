'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ORDER_STATUS_LABEL } from '@/lib/order-status';
import { Block } from '@/components/block';

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

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

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
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">Order Lookup</h1>
          <p className="text-sm text-zinc-500 mt-1">
            비회원 주문 조회 · 주문 시 입력한 이메일과 주문번호를 입력해 주세요.
          </p>
        </Block>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {error && (
            <Block>
              <p className="text-sm text-red-600">{error}</p>
            </Block>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <label htmlFor="lookup-email" className="block text-sm mb-2">Email</label>
              <input
                id="lookup-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Block>
            <Block>
              <label htmlFor="lookup-order" className="block text-sm mb-2">Order Number</label>
              <input
                id="lookup-order"
                className={inputClass}
                placeholder="ORD-20260101-XXXXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </Block>
          </div>

          <Block>
            <button
              type="submit"
              disabled={loading}
              className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              {loading ? '조회 중…' : '주문 조회 →'}
            </button>
          </Block>
        </form>

        {order && (
          <div className="mt-3 space-y-3">
            <Block>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-sm mb-1">Order Number</p>
                  <p className="text-sm text-zinc-700 tracking-wide">{order.orderNumber}</p>
                </div>
                <p className="text-sm text-zinc-700">
                  {ORDER_STATUS_LABEL[order.status] || order.status}
                </p>
              </div>
            </Block>

            <Block>
              <p className="text-sm mb-2">Items</p>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm text-zinc-700">
                    <span>
                      {item.productName} <span className="text-zinc-400">× {item.quantity}</span>
                    </span>
                    <span>{formatKRW(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm md:text-base mt-4 pt-3 border-t border-zinc-200">
                <span>합계</span>
                <span>{formatKRW(order.totalAmount)}</span>
              </div>
            </Block>

            <Block>
              <p className="text-sm mb-2">Timeline</p>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-6">
                <Row label="주문일" value={formatDate(order.createdAt)} />
                <Row label="결제일" value={formatDate(order.paidAt)} />
                <Row label="발송일" value={formatDate(order.shippedAt)} />
                <Row label="배송완료" value={formatDate(order.deliveredAt)} />
              </dl>
            </Block>

            <Block>
              <p className="text-sm mb-2">Tracking</p>
              <p className="text-sm text-zinc-700">
                {tracking || '아직 운송장이 등록되지 않았습니다.'}
              </p>
            </Block>
          </div>
        )}

        <Block className="mt-3">
          <p className="text-sm text-zinc-700">
            회원이신가요?{' '}
            <Link href="/my-page" className="underline hover:text-zinc-500">
              마이페이지에서 주문 내역 보기
            </Link>
          </p>
        </Block>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-zinc-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-zinc-800">{value}</dd>
    </div>
  );
}
