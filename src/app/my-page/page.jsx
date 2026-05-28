'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ORDER_STATUS_LABELS = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '제작 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
};

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('ko-KR');
  } catch {
    return '-';
  }
}

function getYear(value) {
  if (!value) return '----';
  try {
    return String(new Date(value).getFullYear());
  } catch {
    return '----';
  }
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-page');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    setOrdersLoading(true);
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Group orders by year for editorial year-marker layout (like ref image)
  const ordersByYear = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const y = getYear(o.createdAt);
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(o);
    }
    // sort years desc
    return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [orders]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm tracking-wider">(Loading)</p>
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const zipPart = session.user.zipCode ? `(${session.user.zipCode}) ` : '';
  const detailPart = session.user.detailAddress ? ` ${session.user.detailAddress}` : '';
  const fullAddress = session.user.address
    ? `${zipPart}${session.user.address}${detailPart}`.trim()
    : '-';

  const formatPhoneDisplay = (raw) => {
    if (!raw) return '-';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return raw;
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-lg">

        {/* Editorial Header Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 mb-16 md:mb-20 text-xs md:text-sm text-zinc-900 leading-relaxed">
          <p>({session.user.name || 'Member'})</p>
          <p className="md:text-right">(Account)</p>
          <p>(Seoul)</p>
          <p className="md:text-right">(CAGE3000)</p>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl mb-14 md:mb-16 tracking-tight">(My Page)</h1>

        {/* Profile Fields — editorial row grid */}
        <section className="border-t border-zinc-900/90 mb-14">
          <FieldRow label="(Name)" value={session.user.name} />
          <FieldRow label="(Email)" value={session.user.email} />
          <FieldRow label="(Phone)" value={formatPhoneDisplay(session.user.phoneNumber)} />
          <FieldRow label="(Address)" value={fullAddress} />
        </section>

        {/* Inline Action Row */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 mb-24 md:mb-28 text-sm md:text-base">
          <Link
            href="/my-page/edit"
            className="text-blue-600 hover:text-black transition-colors"
          >
            (Edit Profile)
          </Link>

          {session.user.role === 'admin' && (
            <Link
              href="/admin"
              className="text-zinc-900 hover:text-blue-600 transition-colors"
            >
              (Admin Mode)
            </Link>
          )}

          <button
            onClick={async () => {
              if (
                confirm(
                  '정말 탈퇴하시겠습니까? 개인정보는 즉시 익명화되며, 주문 이력은 법령에 따라 보존됩니다.'
                )
              ) {
                try {
                  const res = await fetch('/api/user/delete', { method: 'DELETE' });
                  if (res.ok) {
                    alert('탈퇴가 완료되었습니다.');
                    window.location.href = '/';
                  } else {
                    alert('탈퇴 처리에 실패했습니다.');
                  }
                } catch {
                  alert('오류가 발생했습니다.');
                }
              }
            }}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            (Withdrawal)
          </button>
        </div>

        {/* Order History — editorial with year markers */}
        <section>
          <div className="flex items-baseline justify-between mb-10 border-t border-zinc-900/90 pt-5">
            <h2 className="text-xl md:text-2xl">(Order History)</h2>
            <p className="text-xs md:text-sm text-zinc-500">({orders.length}건)</p>
          </div>

          {ordersLoading ? (
            <p className="text-sm text-zinc-400 py-16 text-center">(Loading)</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-zinc-400 py-16 text-center">(No orders yet)</p>
          ) : (
            <ul className="space-y-1">
              {ordersByYear.map(([year, list]) =>
                list.map((order, idx) => (
                  <li
                    key={order.id}
                    className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-8 py-5 border-b border-zinc-100 items-start"
                  >
                    {/* Year marker (pink only on first of group) */}
                    <p className="text-sm md:text-base pt-0.5">
                      {idx === 0 ? (
                        <span className="bg-pink-100 px-1.5 py-0.5 text-zinc-900">
                          {year}
                        </span>
                      ) : (
                        <span className="text-transparent select-none">{year}</span>
                      )}
                    </p>

                    {/* Order details */}
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <p className="text-sm md:text-base text-zinc-900">
                          (
                          <span className="font-mono text-xs md:text-sm text-zinc-700">
                            {order.orderNumber}
                          </span>
                          )
                          <span className="text-zinc-400 mx-2">·</span>
                          <span className="text-zinc-500 text-xs md:text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </p>
                        <p className="text-sm md:text-base text-zinc-900">
                          {formatKRW(order.totalAmount)}
                          <span className="text-zinc-400 mx-2">·</span>
                          <span className="text-zinc-500 text-xs md:text-sm">
                            ({ORDER_STATUS_LABELS[order.status] || order.status})
                          </span>
                        </p>
                      </div>

                      <ul className="mt-3 space-y-0.5 text-xs md:text-sm text-zinc-500">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span>{formatKRW(item.subtotal)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[200px_1fr] gap-6 md:gap-10 py-5 border-b border-zinc-100 items-baseline">
      <p className="text-sm md:text-base text-zinc-500">{label}</p>
      <p className="text-sm md:text-base text-zinc-900 break-words leading-snug">
        {value || '-'}
      </p>
    </div>
  );
}
