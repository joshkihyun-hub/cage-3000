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
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const zipPart = session.user.zipCode ? `(${session.user.zipCode}) ` : '';
  const detailPart = session.user.detailAddress ? ` ${session.user.detailAddress}` : '';
  const fullAddress = session.user.address
    ? `${zipPart}${session.user.address}${detailPart}`.trim()
    : '-';

  // 010-1234-5678 형태로 보여주기 위한 가벼운 포매터. 11자리 숫자만 처리.
  const formatPhoneDisplay = (raw) => {
    if (!raw) return '-';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return raw;
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl text-center mb-12 text-black font-normal">
          My Page
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-12">
          <Field label="Name" value={session.user.name} />
          <Field label="Phone" value={formatPhoneDisplay(session.user.phoneNumber)} />
          <Field label="Email" value={session.user.email} />
          <Field label="Address" value={fullAddress} />
        </section>

        <div className="space-y-3 mb-16">
          <Link
            href="/my-page/edit"
            className="block w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors text-center"
          >
            Edit Profile
          </Link>

          {session.user.role === 'admin' && (
            <Link
              href="/admin"
              className="block w-full border border-black text-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors text-center"
            >
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
            className="block w-full border border-zinc-200 text-zinc-400 py-4 text-xs uppercase tracking-[0.2em] hover:text-red-500 hover:border-red-500 transition-colors text-center"
          >
            Withdrawal
          </button>
        </div>

        {/* Order History */}
        <section className="border-t border-zinc-100 pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl uppercase tracking-wide">Order History</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">
              {orders.length}건
            </p>
          </div>

          {ordersLoading ? (
            <p className="text-xs uppercase tracking-widest text-zinc-400 py-10 text-center">
              Loading...
            </p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-zinc-400 py-10 text-center">
              아직 주문 내역이 없습니다.
            </p>
          ) : (
            <ul className="space-y-5">
              {orders.map((order) => (
                <li key={order.id} className="border border-zinc-100 px-5 py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">{order.orderNumber}</p>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base text-black">
                        {formatKRW(order.totalAmount)}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </p>
                    </div>
                  </div>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span>{formatKRW(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">{label}</p>
      <p className="text-base text-black break-words leading-snug">{value || '-'}</p>
    </div>
  );
}
