'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/page-container';
import OrderDetailDrawer from './order-detail-drawer';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: '결제 대기' },
  { value: 'paid', label: '결제 완료' },
  { value: 'preparing', label: '제작 중' },
  { value: 'shipped', label: '배송 중' },
  { value: 'delivered', label: '배송 완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'refunded', label: '환불' },
  { value: 'failed', label: '실패' },
];

const STATUS_BADGE = {
  pending: 'bg-zinc-50 text-zinc-600 border-zinc-200',
  paid: 'bg-blue-50 text-blue-700 border-blue-100',
  preparing: 'bg-amber-50 text-amber-700 border-amber-100',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  refunded: 'bg-rose-50 text-rose-600 border-rose-100',
  failed: 'bg-red-50 text-red-600 border-red-100',
};

const STATUS_LABEL = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '제작 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
};

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
  } catch {
    return '-';
  }
}

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

export default function AdminOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [data, setData] = useState({ orders: [], pagination: null, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/orders');
      return;
    }
    if (session?.user?.role !== 'admin') router.push('/');
  }, [authStatus, session, router]);

  const buildQuery = useCallback(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (status) sp.set('status', status);
    sp.set('page', String(page));
    sp.set('pageSize', String(pageSize));
    return sp.toString();
  }, [q, status, page, pageSize]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders?${buildQuery()}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    if (session?.user?.role === 'admin') fetchOrders();
  }, [session, fetchOrders]);

  const summaryCards = useMemo(() => {
    if (!data.summary) return [];
    const byStatus = data.summary.byStatus || {};
    return [
      { label: 'Lifetime Revenue', value: formatKRW(data.summary.lifetimeRevenue) },
      { label: '결제 완료', value: byStatus.paid ?? 0 },
      { label: '제작 중', value: byStatus.preparing ?? 0 },
      { label: '배송 중', value: byStatus.shipped ?? 0 },
    ];
  }, [data.summary]);

  const onOrderUpdated = (updated) => {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  };

  if (authStatus === 'loading' || (authStatus === 'authenticated' && session?.user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h1 className="font-serif text-3xl uppercase">Order Management</h1>
              <p className="text-xs text-zinc-400 mt-2 tracking-wide">
                주문 검색·상태 변경·운송장 입력
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/users"
                className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                Users
              </a>
              <a
                href="/admin"
                className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {summaryCards.map((card) => (
              <div key={card.label} className="border border-zinc-100 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">{card.label}</p>
                <p className="font-serif text-2xl text-black">{card.value}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8 items-end border-y border-zinc-100 py-5">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">Search</label>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="주문번호 / 수령인 / 휴대폰 / 이메일"
                className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-[11px] uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => { setSearchInput(''); setQ(''); setStatus(''); setPage(1); }}
              className="px-5 py-2 text-[11px] uppercase tracking-[0.2em] border border-zinc-200 hover:border-black"
            >
              Reset
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-xs mb-6 bg-red-50 border border-red-100 py-3 px-4">{error}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Date</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Order #</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Customer</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal hidden md:table-cell">Items</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Amount</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Status</th>
                  <th className="py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal hidden md:table-cell">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="py-10 text-center text-xs uppercase tracking-widest text-zinc-400">Loading...</td></tr>
                )}
                {!loading && data.orders.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-xs uppercase tracking-widest text-zinc-400">주문 내역이 없습니다.</td></tr>
                )}
                {!loading && data.orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-3 text-xs text-zinc-500">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-3 font-mono text-xs text-zinc-700">{order.orderNumber}</td>
                    <td className="py-4 px-3">
                      <p className="font-medium text-sm">
                        {order.recipientName}
                        {!order.user && (
                          <span className="ml-2 text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-200 px-1.5 py-0.5">
                            Guest
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400">{order.user?.email || order.guestEmail || '-'}</p>
                    </td>
                    <td className="py-4 px-3 text-xs text-zinc-600 hidden md:table-cell">
                      {order.items.map((i) => `${i.productName}×${i.quantity}`).join(', ')}
                    </td>
                    <td className="py-4 px-3 font-medium">{formatKRW(order.totalAmount)}</td>
                    <td className="py-4 px-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest border ${STATUS_BADGE[order.status] || ''}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-xs text-zinc-500 hidden md:table-cell">
                      {order.trackingNumber ? `${order.trackingCarrier || ''} ${order.trackingNumber}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 text-xs">
              <p className="text-zinc-400 uppercase tracking-widest">
                Page {data.pagination.page} / {data.pagination.totalPages}
                <span className="mx-2 text-zinc-200">·</span>
                Total {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-zinc-200 hover:border-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-zinc-200 hover:border-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderDetailDrawer
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={onOrderUpdated}
      />
    </PageContainer>
  );
}
