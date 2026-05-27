'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

import PageContainer from '@/components/page-container';

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);
}

function deltaPct(now, prev) {
  if (!prev) return null;
  return ((now - prev) / prev) * 100;
}

function Delta({ now, prev }) {
  const d = deltaPct(now, prev);
  if (d === null) return null;
  const positive = d >= 0;
  return (
    <span className={`text-[11px] ml-2 ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
      {positive ? '▲' : '▼'} {Math.abs(d).toFixed(1)}%
    </span>
  );
}

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }
    if (session?.user?.role !== 'admin') router.push('/');
  }, [authStatus, session, router]);

  useEffect(() => {
    if (session?.user?.role !== 'admin') return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error('통계 조회 실패');
        return res.json();
      })
      .then((json) => { if (!cancelled) setStats(json); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session]);

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
              <h1 className="text-3xl uppercase">Dashboard</h1>
              <p className="text-xs text-zinc-400 mt-2 tracking-wide">
                매출·회원·주문 현황
              </p>
            </div>
            <nav className="flex gap-3">
              <Link href="/admin/orders" className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors">
                Orders
              </Link>
              <Link href="/admin/users" className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors">
                Users
              </Link>
            </nav>
          </div>

          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 py-3 px-4 mb-6">{error}</p>}

          {loading && <p className="text-xs uppercase tracking-widest text-zinc-400">Loading...</p>}

          {stats && !loading && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                <KpiCard
                  label="오늘 매출"
                  value={formatKRW(stats.today.revenue)}
                  sub={`${stats.today.orders}건`}
                  delta={<Delta now={stats.today.revenue} prev={stats.yesterday.revenue} />}
                />
                <KpiCard
                  label="이번 달 매출"
                  value={formatKRW(stats.thisMonth.revenue)}
                  sub={`${stats.thisMonth.orders}건`}
                  delta={<Delta now={stats.thisMonth.revenue} prev={stats.prevMonth.revenue} />}
                />
                <KpiCard
                  label="총 매출 (Lifetime)"
                  value={formatKRW(stats.lifetime.revenue)}
                  sub={`평균 주문 ${formatKRW(stats.lifetime.averageOrder)}`}
                />
                <KpiCard
                  label="총 주문"
                  value={stats.lifetime.orders.toLocaleString()}
                  sub={`결제 완료 + 진행 중`}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                <KpiCard label="총 회원" value={stats.users.total.toLocaleString()} />
                <KpiCard label="활성 회원" value={stats.users.active.toLocaleString()} />
                <KpiCard label="신규 (7일)" value={stats.users.newLast7Days.toLocaleString()} />
                <KpiCard label="신규 (30일)" value={stats.users.newLast30Days.toLocaleString()} />
              </div>

              {/* Charts */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <ChartCard title="일별 매출 (지난 30일)">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={stats.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => v.slice(5)}
                        stroke="#a1a1aa"
                        fontSize={10}
                      />
                      <YAxis
                        tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                        stroke="#a1a1aa"
                        fontSize={10}
                      />
                      <Tooltip
                        formatter={(value) => formatKRW(value)}
                        labelFormatter={(v) => v}
                        contentStyle={{ fontSize: 12, border: '1px solid #e4e4e7' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="일별 신규 가입 (지난 30일)">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.dailySignups} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => v.slice(5)}
                        stroke="#a1a1aa"
                        fontSize={10}
                      />
                      <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={10} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, border: '1px solid #e4e4e7' }}
                      />
                      <Bar dataKey="signups" fill="#18181b" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </section>

              {/* Top products */}
              <section className="mb-12">
                <h2 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">
                  베스트셀러 (Top 5)
                </h2>
                {stats.topProducts.length === 0 ? (
                  <p className="text-sm text-zinc-400">아직 판매 데이터가 없습니다.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-normal">상품</th>
                        <th className="py-3 text-right text-[10px] uppercase tracking-widest text-zinc-500 font-normal">판매 수량</th>
                        <th className="py-3 text-right text-[10px] uppercase tracking-widest text-zinc-500 font-normal">매출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.map((p) => (
                        <tr key={p.productId} className="border-b border-zinc-100">
                          <td className="py-3">{p.productName}</td>
                          <td className="py-3 text-right">{p.unitsSold}</td>
                          <td className="py-3 text-right font-medium">{formatKRW(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* Order status breakdown */}
              <section>
                <h2 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">
                  주문 상태별 건수
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats.orderStatuses).map(([k, v]) => (
                    <div key={k} className="border border-zinc-100 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">{k}</p>
                      <p className="text-xl">{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function KpiCard({ label, value, sub, delta }) {
  return (
    <div className="border border-zinc-100 p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{label}</p>
      <p className="text-2xl text-black flex items-baseline">
        {value}
        {delta}
      </p>
      {sub && <p className="text-[11px] text-zinc-400 mt-2">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="border border-zinc-100 p-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">{title}</p>
      {children}
    </div>
  );
}
