'use client';

import { useEffect, useState } from 'react';
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading</p>
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
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">My Page</h1>
        </Block>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <p className="text-sm text-zinc-500 mb-1">Name</p>
            <p className="text-sm md:text-base">{session.user.name || '-'}</p>
          </Block>
          <Block>
            <p className="text-sm text-zinc-500 mb-1">Phone</p>
            <p className="text-sm md:text-base">{formatPhoneDisplay(session.user.phoneNumber)}</p>
          </Block>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <p className="text-sm text-zinc-500 mb-1">Email</p>
            <p className="text-sm md:text-base break-words">{session.user.email || '-'}</p>
          </Block>
          <Block>
            <p className="text-sm text-zinc-500 mb-1">Address</p>
            <p className="text-sm md:text-base break-words leading-snug">{fullAddress}</p>
          </Block>
        </div>

        <Block className="mt-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/my-page/edit" className="hover:underline">
              Edit Profile
            </Link>
            {session.user.role === 'admin' && (
              <Link href="/admin" className="hover:underline">
                Admin Mode
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
              className="text-zinc-500 hover:text-red-600 hover:underline"
            >
              Withdrawal
            </button>
          </div>
        </Block>

        <Block className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base md:text-lg">Order History</h2>
            <p className="text-sm text-zinc-500">{orders.length}건</p>
          </div>
        </Block>

        {ordersLoading ? (
          <Block className="mt-3">
            <p className="text-sm text-zinc-500">Loading</p>
          </Block>
        ) : orders.length === 0 ? (
          <Block className="mt-3">
            <p className="text-sm text-zinc-500">No orders yet</p>
          </Block>
        ) : (
          <div className="mt-3 space-y-3">
            {orders.map((order) => (
              <Block key={order.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-sm">
                    <span className="font-mono text-zinc-700">{order.orderNumber}</span>
                    <span className="text-zinc-400 mx-2">·</span>
                    <span className="text-zinc-600">{formatDate(order.createdAt)}</span>
                  </p>
                  <p className="text-sm">
                    {formatKRW(order.totalAmount)}
                    <span className="text-zinc-400 mx-2">·</span>
                    <span className="text-zinc-600">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </p>
                </div>
                <ul className="mt-3 space-y-0.5 text-sm text-zinc-600">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>{formatKRW(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ children, className = '' }) {
  return (
    <section className={`border-t border-l border-zinc-900 pt-2 pl-3 pb-4 ${className}`}>
      {children}
    </section>
  );
}
